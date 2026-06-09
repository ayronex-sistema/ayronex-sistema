import './globals.css';

export const metadata = {
  title: 'Sistema Ayronex',
  description: 'Importador de Planilha de Funcionários',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}