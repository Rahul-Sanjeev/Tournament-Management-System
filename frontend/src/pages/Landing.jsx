import React from 'react';
import { Link } from 'react-router-dom';
import { ChartBarIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-500 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        
        <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Tournament Management System
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Streamline your karate tournament organization with our comprehensive management system.
              From participant registration to bracket generation, we've got you covered.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/login"
                className="rounded-md bg-karate-blue px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-karate-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-karate-blue"
              >
                Get Started
              </Link>
              <a
                href="https://www.wkf.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold leading-6 text-white hover:text-gray-300"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-white">Powerful Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to run your tournament
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Our platform provides all the tools you need to manage your karate tournament efficiently and professionally.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <FeatureCard
              icon={UserGroupIcon}
              title="Participant Management"
              description="Easily manage participant registrations, track their events, and handle team formations effortlessly."
            />
            <FeatureCard
              icon={ChartBarIcon}
              title="Automated Brackets"
              description="Generate and manage tournament brackets automatically based on registrations and categories."
            />
            <FeatureCard
              icon={ClockIcon}
              title="Match Timer"
              description="Built-in timer system designed specifically for kata and kumite matches with customizable settings."
            />
          </dl>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2025 Tournament Management System. All rights reserved. Developed by Rahul Sanjeev.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-start">
    <div className="rounded-lg bg-white/5 p-2 ring-1 ring-white/10">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <dt className="mt-4 font-semibold text-white">{title}</dt>
    <dd className="mt-2 leading-7 text-gray-400">{description}</dd>
  </div>
);

export default Landing;