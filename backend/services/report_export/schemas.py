from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class ReportSection:
    title: str
    value: Any


@dataclass
class CareerReport:
    candidate_name: str
    candidate_email: str
    generated_at: str
    profile_completion: int
    resume_parsing_status: str
    sections: list[ReportSection] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)

