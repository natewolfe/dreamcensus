import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List

TYPEFORM_API = "https://api.typeform.com/forms/{form_id}"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Export a Typeform form definition to JSON and a readable Markdown summary. "
            "Requires a personal access token with form read permissions."
        )
    )
    parser.add_argument(
        "--form-id",
        default="NpE4W7",
        help="The Typeform form ID (e.g., the NpE4W7 portion of the Dream Census URL).",
    )
    parser.add_argument(
        "--token",
        default=os.getenv("TYPEFORM_TOKEN"),
        help="Typeform personal access token. Defaults to TYPEFORM_TOKEN env var.",
    )
    parser.add_argument(
        "--json-out",
        default="data/typeform-form.json",
        help="Path to write the raw Typeform JSON export.",
    )
    parser.add_argument(
        "--markdown-out",
        default="docs/questionnaire.md",
        help="Path to write a Markdown summary of the form questions and flow.",
    )
    return parser.parse_args()


def ensure_token(token: str | None) -> str:
    if not token:
        raise ValueError(
            "A Typeform access token is required. Set TYPEFORM_TOKEN or pass --token."
        )
    return token


def fetch_form_definition(form_id: str, token: str) -> Dict[str, Any]:
    url = TYPEFORM_API.format(form_id=form_id)
    request = urllib.request.Request(url)
    request.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(request) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as err:
        raise RuntimeError(
            f"Failed to fetch form {form_id} (HTTP {err.code}): {err.reason}"
        ) from err
    except urllib.error.URLError as err:
        raise RuntimeError(f"Failed to reach Typeform: {err.reason}") from err


def write_json_export(payload: Dict[str, Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def format_choices(field: Dict[str, Any]) -> List[str]:
    properties = field.get("properties", {})
    choices: List[Dict[str, Any]] = properties.get("choices", [])
    return [choice.get("label", "") for choice in choices]


def format_markdown_summary(payload: Dict[str, Any]) -> str:
    lines: List[str] = []

    title = payload.get("title", "Untitled Typeform")
    lines.append(f"# {title}")
    lines.append("")

    welcome_screens = payload.get("welcome_screens", [])
    if welcome_screens:
        lines.append("## Welcome screens")
        for screen in welcome_screens:
            lines.append(f"- **{screen.get('title', '').strip()}**: {screen.get('properties', {}).get('description', '').strip()}")
        lines.append("")

    fields = payload.get("fields", [])
    if fields:
        lines.append("## Questions")
        for index, field in enumerate(fields, start=1):
            field_title = field.get("title", "Untitled question").strip()
            field_type = field.get("type", "unknown")
            lines.append(f"{index}. **{field_title}** (`{field_type}`)")

            description = field.get("properties", {}).get("description")
            if description:
                lines.append(f"   - Description: {description.strip()}")

            choices = format_choices(field)
            if choices:
                lines.append("   - Options:")
                for choice in choices:
                    lines.append(f"     - {choice.strip()}")

            validations = field.get("validations", {})
            if validations:
                lines.append("   - Validations:")
                for key, value in validations.items():
                    lines.append(f"     - {key}: {value}")

            if field.get("logic"):
                lines.append("   - Logic: see logic section below for linked rules.")

            lines.append("")

    logic = payload.get("logic", [])
    if logic:
        lines.append("## Logic")
        for block in logic:
            condition = block.get("condition", {})
            source = block.get("ref")
            actions = block.get("actions", [])
            lines.append(f"- From `{source}`: {condition if condition else 'conditional actions'}")
            for action in actions:
                lines.append(f"  - Action: {json.dumps(action)}")
        lines.append("")

    thankyou_screens = payload.get("thankyou_screens", [])
    if thankyou_screens:
        lines.append("## Thank you screens")
        for screen in thankyou_screens:
            lines.append(
                f"- **{screen.get('title', '').strip()}**: {screen.get('properties', {}).get('description', '').strip()}"
            )
        lines.append("")

    if not lines:
        return "# Questionnaire summary\n\nNo content found in the form payload."

    return "\n".join(lines).rstrip() + "\n"


def write_markdown_summary(payload: Dict[str, Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    content = format_markdown_summary(payload)
    path.write_text(content, encoding="utf-8")


def main() -> int:
    args = parse_args()
    try:
        token = ensure_token(args.token)
        payload = fetch_form_definition(args.form_id, token)
        write_json_export(payload, Path(args.json_out))
        write_markdown_summary(payload, Path(args.markdown_out))
        print(f"Exported form {args.form_id} to {args.json_out} and {args.markdown_out}")
        return 0
    except Exception as exc:  # noqa: BLE001
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
