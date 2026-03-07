import Link from 'next/link';
import { Upload, FileText, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { APP_ROUTES } from '@/constants/routes';

export default function HomePage(): JSX.Element {
  const features = [
    {
      icon: Upload,
      title: 'Upload Label',
      description: 'Scan alcohol beverage labels using advanced OCR technology.',
      href: APP_ROUTES.uploadLabel,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: FileText,
      title: 'Application Form',
      description: 'Enter COLA application data for comprehensive validation.',
      href: APP_ROUTES.applicationForm,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Layers,
      title: 'Batch Validation',
      description: 'Validate multiple labels simultaneously for efficiency.',
      href: APP_ROUTES.batchValidation,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: CheckCircle2,
      title: 'Results',
      description: 'View detailed compliance reports and validation results.',
      href: APP_ROUTES.validationResults,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Label',
      description: 'Upload your alcohol beverage label image',
    },
    {
      number: '02',
      title: 'Enter Application Data',
      description: 'Provide COLA application information',
    },
    { number: '03', title: 'Run Validation', description: 'AI validates against TTB regulations' },
    { number: '04', title: 'Review Report', description: 'Get detailed compliance results' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Validate Alcohol Labels in{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Seconds
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              AI-assisted verification of alcohol beverage labels against TTB regulations and COLA
              application data. Ensure compliance with confidence.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href={APP_ROUTES.uploadLabel}
                className="group rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-500 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Upload Label
                <ArrowRight className="ml-2 inline-block h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={APP_ROUTES.batchValidation}
                className="rounded-full border-2 border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Batch Validate
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for compliance
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Powerful features designed for efficiency and accuracy
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-gray-300"
              >
                <div className={`inline-flex rounded-xl ${feature.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Four simple steps to complete label validation
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-8 hidden h-8 w-8 text-gray-300 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to validate your labels?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Start validating labels against TTB regulations today
          </p>
          <div className="mt-8">
            <Link
              href={APP_ROUTES.uploadLabel}
              className="inline-flex items-center rounded-full bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
