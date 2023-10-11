export const metadata = {
  title: "Chat | Home",
  description: "Welcome to the Chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full flex h-screen">{children}</div>;
}
