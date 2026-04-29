import { Head } from '@inertiajs/react'

export default function Edit({ exam, question }) {
  return (
    <>
      <Head title={`Edit Question - ${exam.title}`} />
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">Edit Question</h1>
        <p className="text-gray-600">{exam.title}</p>
      </div>
    </>
  )
}
