type JsonValue = Record<string, unknown> | Array<Record<string, unknown>>;
/** Serialize safely when embedding JSON-LD in HTML. Data is server-side and not user controlled. */
export default function JsonLd({ data }: { data: JsonValue }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify(data).replace(/</g, "\\u003c")
  }}/>;
}
