import Link from "next/link";

export default function Home() {
  return (
    <nav>
      <Link href="/about">關於我們</Link>
      <Link href="/courses">課程列表</Link>
    </nav>
  );
}
