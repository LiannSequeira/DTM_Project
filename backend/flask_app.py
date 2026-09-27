import os
import json
import uuid
import hashlib
from pathlib import Path
from urllib import request as urllib_request
from urllib import error as urllib_error

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    from supabase import create_client
except ImportError:
    create_client = None


# ============================================================
# CONFIG
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CATALOG_FILE = DATA_DIR / "catalog" / "index.json"

load_dotenv(BASE_DIR / ".env")
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

PORT = int(os.getenv("PORT", "5000"))


# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# SUPABASE
# ============================================================

supabase = None

if create_client and SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(
            SUPABASE_URL,
            SUPABASE_KEY
        )
        print("Supabase connected")
    except Exception as exc:
        print(f"Supabase connection failed: {exc}")
        supabase = None
else:
    print("Supabase not configured")


# ============================================================
# LOCAL MEMORY FALLBACK
# ============================================================

SESSION_MEMORY = {}


# ============================================================
# DOCUMENT CATALOG
# ============================================================

def load_catalog():
    if not CATALOG_FILE.exists():
        print(f"Catalog not found: {CATALOG_FILE}")
        return []

    try:
        with open(CATALOG_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)

        if isinstance(data, list):
            return data

        if isinstance(data, dict):
            for key in ("documents", "items", "catalog"):
                if isinstance(data.get(key), list):
                    return data[key]

        return []

    except Exception as exc:
        print(f"Catalog loading failed: {exc}")
        return []


DOCUMENTS = load_catalog()

print(f"Loaded {len(DOCUMENTS)} documents")


# ============================================================
# HELPERS
# ============================================================

def text_of(doc):
    values = [
        doc.get("title", ""),
        doc.get("filename", ""),
        doc.get("subject", ""),
        doc.get("course_code", ""),
        doc.get("category", ""),
        doc.get("source_type", ""),
    ]

    return " ".join(
        str(value) for value in values if value
    ).lower()


def classify_question(question):
    q = question.lower()

    pyq_words = [
        "pyq",
        "previous year",
        "previous year question",
        "question paper",
        "question papers",
        "past paper",
        "exam paper",
        "question bank",
    ]

    official_words = [
        "hostel",
        "scholarship",
        "safety",
        "ragging",
        "regulation",
        "regulations",
        "policy",
        "rules",
        "attendance",
        "discipline",
    ]

    if any(word in q for word in pyq_words):
        return "pyq"

    if any(word in q for word in official_words):
        return "official"

    return "general"


def document_source_type(doc):
    return str(
        doc.get("source_type")
        or doc.get("authority")
        or ""
    ).lower()


def retrieve_documents(question, limit=5):
    question_type = classify_question(question)
    q = question.lower()

    candidates = []

    for doc in DOCUMENTS:
        source = document_source_type(doc)
        searchable = text_of(doc)

        # Keep official policy queries inside official documents.
        if question_type == "official":
            is_official = (
                source == "official"
                or doc.get("authority") == "official"
                or "official" in source
            )

            if not is_official:
                continue

        # Keep PYQ queries inside PYQs.
        if question_type == "pyq":
            is_pyq = (
                source in ("pyq", "pyqp")
                or "pyq" in source
                or "question" in searchable
            )

            if not is_pyq:
                continue

        score = 0

        for word in q.split():
            word = word.strip(".,?!:;()[]{}")

            if len(word) < 3:
                continue

            if word in searchable:
                score += 1

        if score > 0:
            candidates.append((score, doc))

    candidates.sort(
        key=lambda item: item[0],
        reverse=True
    )

    return [doc for _, doc in candidates[:limit]]


def get_document_text(doc):
    """
    Uses text already present in the catalog if available.
    """
    for key in ("text", "content", "extracted_text", "excerpt"):
        value = doc.get(key)

        if value:
            return str(value)

    return ""


def build_context(documents):
    if not documents:
        return ""

    chunks = []

    for index, doc in enumerate(documents, start=1):
        title = (
            doc.get("title")
            or doc.get("filename")
            or f"Document {index}"
        )

        text = get_document_text(doc)

        if not text:
            metadata = []

            for key in (
                "subject",
                "course_code",
                "semester",
                "category",
                "source_type",
                "authority",
            ):
                value = doc.get(key)

                if value:
                    metadata.append(
                        f"{key}: {value}"
                    )

            text = ", ".join(metadata)

        chunks.append(
            f"[Document {index}]\n"
            f"Title: {title}\n"
            f"Content: {text[:8000]}"
        )

    return "\n\n".join(chunks)


def make_citations(documents):
    citations = []

    for doc in documents:
        document_id = (
            doc.get("document_id")
            or doc.get("id")
            or hashlib.sha256(
                str(doc).encode()
            ).hexdigest()[:12]
        )

        title = (
            doc.get("title")
            or doc.get("filename")
            or "Document"
        )

        citations.append({
            "document_id": str(document_id),
            "title": title,
            "filename": doc.get("filename"),
            "source_type": doc.get("source_type"),
            "category": doc.get("category"),
            "url": (
                f"http://localhost:{PORT}"
                f"/api/documents/{document_id}/file"
            )
        })

    return citations


# ============================================================
# SUPABASE MEMORY
# ============================================================

def ensure_conversation(conversation_id, student_id=None):
    if not supabase:
        return

    try:
        existing = (
            supabase
            .table("conversations")
            .select("id")
            .eq("id", conversation_id)
            .limit(1)
            .execute()
        )

        if existing.data:
            return

        row = {
            "id": conversation_id
        }

        if student_id:
            row["student_id"] = student_id

        supabase \
            .table("conversations") \
            .insert(row) \
            .execute()

    except Exception as exc:
        print(f"Conversation persistence failed: {exc}")


def get_recent_messages(conversation_id, limit=10):
    if supabase:
        try:
            response = (
                supabase
                .table("messages")
                .select("role,content,created_at")
                .eq("conversation_id", conversation_id)
                .order("created_at", desc=False)
                .limit(limit)
                .execute()
            )

            return response.data or []

        except Exception as exc:
            print(f"Supabase history failed: {exc}")

    return SESSION_MEMORY.get(
        conversation_id,
        []
    )[-limit:]


def save_message(
    conversation_id,
    role,
    content
):
    SESSION_MEMORY.setdefault(
        conversation_id,
        []
    ).append({
        "role": role,
        "content": content
    })

    if not supabase:
        return

    try:
        supabase \
            .table("messages") \
            .insert({
                "conversation_id": conversation_id,
                "role": role,
                "content": content
            }) \
            .execute()

    except Exception as exc:
        print(f"Message persistence failed: {exc}")


# ============================================================
# GROQ
# ============================================================

def ask_groq(question, context, history):
    if not GROQ_API_KEY:
        return (
            "Groq is not configured. "
            "Add GROQ_API_KEY to your .env file."
        )

    messages = [
        {
            "role": "system",
            "content": (
                "You are Campus Companion, an AI assistant "
                "for SRM students.\n\n"
                "Use the provided institutional context "
                "to answer questions.\n"
                "Do not invent SRM policies, rules, dates, "
                "requirements, or academic information.\n"
                "If the available context does not contain "
                "enough information, clearly say that the "
                "information cannot be verified from the "
                "available documents.\n"
                "Use previous conversation messages when "
                "answering follow-up questions.\n"
                "Keep answers concise, clear and useful."
            )
        }
    ]

    # Conversation memory
    for message in history[-10:]:
        role = message.get("role")
        content = message.get("content", "")

        if role in ("user", "assistant") and content:
            messages.append({
                "role": role,
                "content": str(content)[:5000]
            })

    # Current request
    messages.append({
        "role": "user",
        "content": (
            f"Student question:\n{question}\n\n"
            f"Institutional context:\n{context}"
        )
    })

    payload = {
        "model": GROQ_MODEL,
        "temperature": 0.2,
        "messages": messages
    }

    body = json.dumps(payload).encode("utf-8")

    req = urllib_request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=body,
        headers={
            "Authorization": (
                f"Bearer {GROQ_API_KEY}"
            ),
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib_request.urlopen(
            req,
            timeout=60
        ) as response:

            raw = response.read().decode(
                "utf-8"
            )

            data = json.loads(raw)

        answer = (
            data
            .get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )

        if not answer:
            return "I couldn't generate a response."

        return answer

    except urllib_error.HTTPError as exc:
        error_body = exc.read().decode(
            "utf-8",
            errors="replace"
        )

        print(
            f"\nGroq HTTP ERROR {exc.code}"
        )
        print(error_body)

        return (
            f"Groq request failed ({exc.code}). "
            f"Check the Flask terminal for details."
        )

    except Exception as exc:
        print(
            f"\nGroq ERROR: {repr(exc)}"
        )

        return (
            "The AI service is temporarily "
            "unavailable."
        )


# ============================================================
# ROUTES
# ============================================================

@app.get("/")
def root():
    return jsonify({
        "name": "Campus Companion API",
        "status": "running"
    })


@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "groq_configured": bool(GROQ_API_KEY),
        "groq_model": GROQ_MODEL,
        "supabase_configured": bool(supabase),
        "documents_loaded": len(DOCUMENTS)
    })


@app.get("/api/chat/history")
def chat_history():
    conversation_id = request.args.get(
        "session_id"
    ) or request.args.get(
        "conversation_id"
    )

    if not conversation_id:
        return jsonify({
            "error": "session_id is required"
        }), 400

    return jsonify({
        "conversation_id": conversation_id,
        "messages": get_recent_messages(
            conversation_id,
            limit=50
        )
    })


@app.post("/api/chat")
def chat():
    try:
        payload = request.get_json(
            silent=True
        ) or {}

        question = str(
            payload.get("message", "")
        ).strip()

        if not question:
            return jsonify({
                "error": "message is required"
            }), 400

        conversation_id = (
            payload.get("session_id")
            or payload.get("conversation_id")
            or str(uuid.uuid4())
        )

        student_id = (
            payload.get("student_id")
            or payload.get("user_id")
        )

        ensure_conversation(
            conversation_id,
            student_id
        )

        # Get memory before saving current message.
        history = get_recent_messages(
            conversation_id,
            limit=10
        )

        documents = retrieve_documents(
            question,
            limit=5
        )

        context = build_context(
            documents
        )

        save_message(
            conversation_id,
            "user",
            question
        )

        # If there are no matching documents,
        # still allow the model to answer conversational
        # follow-ups, but it must not invent institutional facts.
        if not context:
            context = (
                "No matching institutional document "
                "was retrieved for this question."
            )

        answer = ask_groq(
            question,
            context,
            history
        )

        save_message(
            conversation_id,
            "assistant",
            answer
        )

        return jsonify({
            "answer": answer,
            "citations": make_citations(
                documents
            ),
            "conversation_id": conversation_id,
            "session_id": conversation_id
        })

    except Exception as exc:
        print(
            f"CHAT ROUTE ERROR: {repr(exc)}"
        )

        return jsonify({
            "error": str(exc)
        }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":
    print("")
    print("=" * 60)
    print("CAMPUS COMPANION API")
    print("=" * 60)
    print(f"Model: {GROQ_MODEL}")
    print(
        f"Groq configured: "
        f"{bool(GROQ_API_KEY)}"
    )
    print(
        f"Supabase configured: "
        f"{bool(supabase)}"
    )
    print(
        f"Documents loaded: "
        f"{len(DOCUMENTS)}"
    )
    print(
        f"Server: "
        f"http://localhost:{PORT}"
    )
    print("=" * 60)
    print("")

    app.run(
        host="0.0.0.0",
        port=PORT,
        debug=True
    )