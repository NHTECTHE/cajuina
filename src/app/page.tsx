import Navbar from "@/components/Home/Navbar"
import HeroBanner from "@/components/Home/HeroBanner"
import About from "@/components/Home/About"
import Products from "@/components/Home/Products"
import Partners from "@/components/Home/Partners"
import InfoColumns from "@/components/Home/InfoColumns"
import Signup from "@/components/Home/Signup"
import Contact from "@/components/Home/Contact"

export default function HomePage() {
  return (
    <main className="flex flex-col w-full overflow-x-hidden">
      <Navbar />
      <HeroBanner />
      <About />
      <Products />
      <Partners />
      <InfoColumns />
      <Signup />
      <Contact />
    </main>
  )
}
