import { monogram, shortName, type Cert } from "@/lib/certs";

/** The certification's logo if one has been fetched, otherwise a lettered placeholder. */
export default function CertBadge({ cert, size }: { cert: Cert; size: number }) {
  const name = shortName(cert.title);
  if (cert.logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="cert-badge" src={cert.logo} alt={`${name} badge`} width={size} height={size} loading="lazy" />;
  }
  return (
    <span className="cert-badge cert-badge--mono" style={{ width: size, height: size, fontSize: size * 0.3 }} role="img" aria-label={`${name} badge`}>
      {monogram(cert.title)}
    </span>
  );
}
