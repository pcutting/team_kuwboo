import { Link } from 'react-router';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="text-xl font-semibold text-stone-900 tracking-tight">
            Kuwboo
          </span>
        </div>
        <Link
          to="/login"
          className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
        >
          Admin Sign In
        </Link>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-32">
        <div className="max-w-2xl">
          <h1 className="text-5xl sm:text-6xl font-bold text-stone-900 tracking-tight leading-[1.1]">
            Connect with your
            <br />
            <span className="text-amber-600">local community</span>
          </h1>
          <p className="mt-6 text-lg text-stone-600 leading-relaxed max-w-lg">
            Discover people, places, and things around you. Share moments,
            explore your neighborhood, and build real connections — all in one
            place.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              App Store
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.5 1.448a1 1 0 010 1.49l-2.5 1.448-2.532-2.533 2.532-2.533zM5.864 3.458L16.8 9.79l-2.302 2.302-8.634-8.634z" />
              </svg>
              Google Play
            </a>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-32 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Video',
              desc: 'Share and discover short videos from your community',
              icon: '🎬',
            },
            {
              title: 'Social',
              desc: 'Posts, stories, and connections with people nearby',
              icon: '💬',
            },
            {
              title: 'Shop',
              desc: 'Buy, sell, and auction items in your local marketplace',
              icon: '🛍️',
            },
            {
              title: 'YoYo',
              desc: 'Discover who is nearby and send a wave to connect',
              icon: '👋',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-stone-200/50"
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-stone-900">{feature.title}</h3>
              <p className="mt-1 text-sm text-stone-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white/40">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Kuwboo. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-stone-500">
            <a href="#" className="hover:text-stone-900 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-stone-900 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-stone-900 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
