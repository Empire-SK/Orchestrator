
import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS, COLORS } from '../constants';

const TrustedBy = () => (
  <div className="py-12 border-y border-slate-100 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
        Advancing Accessibility With
      </p>
      <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale">
        <span className="text-xl font-bold text-slate-900">Health Institutes</span>
        <span className="text-xl font-bold text-slate-900">Assistive Tech Labs</span>
        <span className="text-xl font-bold text-slate-900">Rehab Centers</span>
        <span className="text-xl font-bold text-slate-900">NGOs</span>
      </div>
    </div>
  </div>
);

const Workflow = () => (
  <section className="py-24 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Observation to Intervention</h2>
        <p className="text-slate-500">A specialized workflow for disability research and assistive product discovery.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { step: "01", title: "Video Capture", desc: "Upload footage of daily activities and add notes on the user's specific disability context." },
          { step: "02", title: "Barrier Analysis", desc: "AI identifies physical, cognitive, and sensory barriers hidden in the raw footage." },
          { step: "03", title: "Assistive Strategy", desc: "Automatically generate need statements and clinical feasibility tables for new devices." }
        ].map((item, i) => (
          <div key={i} className="relative p-8 bg-white rounded-3xl border border-slate-200 premium-shadow">
            <div className="text-5xl font-black text-slate-100 absolute top-4 right-8">{item.step}</div>
            <h3 className="text-xl font-bold mb-4 relative z-10">{item.title}</h3>
            <p className="text-slate-500 text-sm relative z-10">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const TablePreview = () => (
  <section className="py-32 bg-white px-6">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-20 items-center">
        <div className="lg:w-1/2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
            <ICONS.Table className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
            Evidence-Based <br /> Assistive Research
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Stop losing insights in raw video files. Orchestrator builds structured clinical evaluation tables that help teams prioritize high-impact assistive solutions.
          </p>
          <ul className="space-y-4">
            {['Identify Functional Barriers', 'Score Independent Living Impact', 'Export to Clinical Reports'].map((t, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                <ICONS.Check className="text-blue-600 w-5 h-5" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:w-1/2 w-full">
          <div className="bg-slate-900 rounded-3xl p-2 premium-shadow">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-800">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 bg-slate-50">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <table className="w-full text-[10px] md:text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 text-left">Assistive Need</th>
                    <th className="p-3 text-left">Impact</th>
                    <th className="p-3 text-left">Feasibility</th>
                  </tr>
                </thead>
                <tbody className="text-slate-500">
                  <tr className="border-b border-slate-100">
                    <td className="p-3 font-medium text-slate-900">One-handed dressing tool</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">9.5</span></td>
                    <td className="p-3 text-green-600">High</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-3 font-medium text-slate-900">Voice-controlled kitchenware</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">8.8</span></td>
                    <td className="p-3 text-blue-600">Med</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-900">Step-climbing wheelchair</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">7.9</span></td>
                    <td className="p-3 text-amber-600">Low</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Home = () => (
  <div className="overflow-hidden">
    {/* Hero */}
    <section className="relative pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 max-w-5xl mx-auto leading-[1.1]">
          Advancing <span className="text-blue-600">Assistive Innovation</span> Through AI
        </h1>
        <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload observation videos of persons with disabilities, add clinical notes, and let AI generate structured need-finding tables for assistive technology.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/demo" className="w-full sm:w-auto whitespace-nowrap px-8 py-4 sm:px-10 sm:py-5 bg-slate-900 text-white rounded-full font-bold text-base sm:text-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            Start Need Finding <ICONS.ArrowRight className="w-5 h-5" />
          </Link>
          <button className="w-full sm:w-auto whitespace-nowrap px-8 py-4 sm:px-10 sm:py-5 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-base sm:text-lg hover:bg-slate-50 transition-all">
            Researcher Login
          </button>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      </div>
    </section>

    <TrustedBy />
    <Workflow />
    <TablePreview />

    {/* CTA */}
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-16 text-center text-white relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 -mb-32 -mr-32"></div>
        <h2 className="text-4xl font-bold mb-8">Empower Independent Living</h2>
        <p className="text-slate-400 mb-12 max-w-xl mx-auto">Join researchers and developers worldwide using Orchestrator to solve complex accessibility challenges.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/demo" className="whitespace-nowrap px-8 py-3.5 sm:px-8 sm:py-4 bg-white text-slate-900 rounded-full font-bold text-base sm:text-lg hover:shadow-xl transition-all">
            Launch Researcher Dashboard
          </Link>
          <button className="whitespace-nowrap px-8 py-3.5 sm:px-8 sm:py-4 border border-slate-700 rounded-full font-bold text-base sm:text-lg hover:bg-slate-800 transition-all">
            Request Demo
          </button>
        </div>
      </div>
    </section>
  </div>
);

export default Home;
