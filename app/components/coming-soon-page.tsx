import Footer from './footer'
import Header from './header'
import { ComingSoon } from './coming-soon'

type ComingSoonPageProps = {
  title: string
  description?: string
}

export function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <main className="min-h-screen bg-gray-800 text-white flex flex-col">
      <Header />
      <div className="flex-1 flex items-center">
        <ComingSoon title={title} description={description} />
      </div>
      <Footer />
    </main>
  )
}
