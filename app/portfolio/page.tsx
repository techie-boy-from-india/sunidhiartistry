import { getCms,visibleCms } from "@/lib/cms";
import PortfolioGallery from "@/components/PortfolioGallery";
export const dynamic="force-dynamic";
export default async function Portfolio(){
  const {data}=await getCms();
  const {gallery}=visibleCms(data);
  return <main><section className="page-banner centered"><span className="chip">OUR PORTFOLIO</span>
    <h1>Real Brides, <em>Real</em> Moments.</h1>
    <p>A small window into the beautiful faces we&apos;ve had the joy of working on.</p></section>
    <PortfolioGallery photos={gallery}/>
    <section className="centered section-space blush-block"><span className="chip">BEFORE & AFTER</span>
      <h2>The <em>Transformation</em></h2>
      <p>Transformation previews and video reels will be added when the artist provides approved media.</p>
    </section></main>;
}
