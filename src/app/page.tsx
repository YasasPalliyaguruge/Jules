import DailyCheckIn from '../components/DailyCheckIn';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-sky-50">
      <section className="px-6 pb-14 pt-20 md:pb-20 md:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
            Private reflection, without pressure
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            A quiet place to check in with yourself
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Jules helps you record mood, energy, sleep, intentions and notes in your own browser. No account, diagnosis or public sharing is involved.
          </p>
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left text-sm leading-6 text-amber-900">
            Jules is a personal journaling tool, not medical care, therapy, diagnosis or crisis support.
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <DailyCheckIn />
        </div>
      </section>
    </div>
  );
}
