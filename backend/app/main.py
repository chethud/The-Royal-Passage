import sys
from pathlib import Path

# Generated protobuf modules use `royalpassage.v1.*` imports.
_GEN_ROOT = Path(__file__).resolve().parent / "rpc" / "gen"
if str(_GEN_ROOT) not in sys.path:
    sys.path.insert(0, str(_GEN_ROOT))

from starlette.middleware.cors import CORSMiddleware

from app.config import settings
from app.rpc.servicer import RoyalPassageServiceImpl
from royalpassage.v1.service_connect import RoyalPassageServiceASGIApplication

connect_app = RoyalPassageServiceASGIApplication(RoyalPassageServiceImpl())

app = CORSMiddleware(
    connect_app,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)
