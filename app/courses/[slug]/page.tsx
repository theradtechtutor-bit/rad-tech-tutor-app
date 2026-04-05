import { redirect } from 'next/navigation';

export default async function CoursesSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/catalog/${slug}`);
}
