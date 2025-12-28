# The Dream Census Questionnaire Capture

This repository tracks work on reproducing the public Typeform survey for **The Dream Census** at `https://form.typeform.com/to/NpE4W7`.

Because the form is hosted on Typeform, the first step is to export the question text, flow, and logic so we can rebuild it as a standalone experience. The `scripts/export_typeform.py` helper fetches the live form and writes both a JSON archive and a human-readable Markdown summary.

## Capturing the questionnaire

1. Obtain a Typeform personal access token with read access to forms and set it as `TYPEFORM_TOKEN` in your environment. See the [Typeform docs](https://www.typeform.com/developers/get-started/personal-access-token/) for instructions.
2. Run the export script:

   ```bash
   python scripts/export_typeform.py --form-id NpE4W7 \
     --json-out data/typeform-NpE4W7.json \
     --markdown-out docs/questionnaire.md
   ```

3. Open `docs/questionnaire.md` to review the captured questions, options, welcome/thank-you screens, and branching logic. The raw Typeform schema is saved next to it for reference.

### Offline or blocked network environments

If the environment cannot reach Typeform (for example, behind a restrictive proxy), the script will print a clear error and exit. In that case:

- Use the provided `--from-json` flag with a previously exported JSON payload (e.g., one generated on a machine with network access):

  ```bash
  python scripts/export_typeform.py --from-json data/typeform-NpE4W7.json \
    --markdown-out docs/questionnaire.md
  ```

- If no cached JSON is available, you can still populate `docs/questionnaire.md` manually using the provided section headers.

## Next steps

Once the questionnaire content is captured, we can implement a standalone survey app that mirrors the same flow and logic. The generated Markdown summary will be the source of truth for rebuilding the UI and routing.
