from __future__ import annotations

from typing import TypeVar

from google.protobuf.json_format import MessageToDict, ParseDict
from google.protobuf.message import Message
from pydantic import BaseModel

T = TypeVar("T", bound=Message)


def pydantic_to_proto(model: BaseModel, proto_cls: type[T]) -> T:
    msg = proto_cls()
    ParseDict(model.model_dump(mode="json"), msg, ignore_unknown_fields=True)
    return msg


def proto_to_pydantic(proto_msg: Message, pydantic_cls: type[BaseModel]) -> BaseModel:
    data = MessageToDict(proto_msg, preserving_proto_field_name=False)
    return pydantic_cls.model_validate(data)


def proto_to_pydantic_partial(proto_msg: Message, pydantic_cls: type[BaseModel]) -> BaseModel:
    data = MessageToDict(proto_msg, preserving_proto_field_name=False)
    return pydantic_cls.model_validate({k: v for k, v in data.items() if v not in (None, "", [])})
