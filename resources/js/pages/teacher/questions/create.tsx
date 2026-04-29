import { Head } from '@inertiajs/react'

export default function Create({ exam }) {
  return (
    <>
      <Head title={`Create Question - ${exam.title}`} />
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">Create Question</h1>
        <p className="text-gray-600">{exam.title}</p>
      </div>
    </>
  )
}
