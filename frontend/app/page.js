import HomeScreen from './_components/home-screen';

export default async function Home({ searchParams }) {
  const { deleted } = await searchParams;
  return <HomeScreen deleted={deleted === '1'} />;
}
