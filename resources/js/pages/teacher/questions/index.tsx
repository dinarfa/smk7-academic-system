import { Head } from '@inertiajs/react'

export default function Index({ exam, questions }) {
  return (
    <>
      <Head title={`${exam.title} - Questions`} />
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <p className="text-gray-600 mb-4">{questions.length} questions</p>
      </div>
    </>
  )
}
