export default function ReviewShareNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-sm px-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">🔒</span>
        </div>
        <h1 className="text-xl font-semibold">Link inválido ou expirado</h1>
        <p className="text-sm text-muted-foreground">
          Este link de review não é mais válido. Entre em contato com a TBO para solicitar um
          novo link de acesso.
        </p>
      </div>
    </div>
  );
}
