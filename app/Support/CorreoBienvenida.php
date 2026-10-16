<?php

namespace App\Support;

use PHPMailer\PHPMailer\PHPMailer;
use Throwable;

class CorreoBienvenida
{
    /**
     * @return array{asunto: string, html: string, texto: string}
     */
    public function mensaje(string $nombre, string $clave): array
    {
        $frases = [
            ['He fallado una y otra vez en mi vida. Y por eso tengo éxito.', 'Michael Jordan'],
            ['El talento gana partidos. El trabajo en equipo y la inteligencia ganan campeonatos.', 'Michael Jordan'],
            ['No dejes que lo que no podés hacer interfiera con lo que sí podés.', 'John Wooden'],
        ];

        $lineas = [];
        $bloques = [];
        foreach ($frases as [$frase, $autor]) {
            $lineas[] = '"'.$frase.'" — '.$autor;
            $bloques[] = '<p style="margin:0 0 12px;"><em>"'.e($frase).'"</em><br>'.e($autor).'</p>';
        }

        $asunto = 'THE ROOKIE: tu cuenta y tu contraseña';
        $texto = "Hola {$nombre}.\n\n"
            ."Gracias por crear tu cuenta en THE ROOKIE. La cancha ya está abierta.\n\n"
            ."Tu contraseña es: {$clave}\n\n"
            ."Entrá con tu email y con esa clave. Guardala. No la compartas.\n\n"
            .implode("\n", $lineas)."\n\n"
            ."Nos vemos en la vereda.\nTHE ROOKIE";

        $html = '<div style="font-family:Arial,sans-serif;color:#111;line-height:1.45;">'
            .'<p>Hola '.e($nombre).'.</p>'
            .'<p>Gracias por crear tu cuenta en <strong>THE ROOKIE</strong>. La cancha ya está abierta.</p>'
            .'<p>Tu contraseña es: <strong>'.e($clave).'</strong></p>'
            .'<p>Entrá con tu email y con esa clave. Guardala. No la compartas.</p>'
            .implode('', $bloques)
            .'<p>Nos vemos en la vereda.<br>THE ROOKIE</p>'
            .'</div>';

        return ['asunto' => $asunto, 'html' => $html, 'texto' => $texto];
    }

    public function enviar(string $nombre, string $email, string $clave): void
    {
        $mensaje = $this->mensaje($nombre, $clave);
        $mail = new PHPMailer(true);
        $mail->CharSet = 'UTF-8';
        $mail->Timeout = 12;
        $mail->isSMTP();
        $mail->Host = (string) config('mail.mailers.smtp.host');
        $mail->Port = (int) config('mail.mailers.smtp.port');

        $usuario = config('mail.mailers.smtp.username');
        $secreto = config('mail.mailers.smtp.password');
        $hayClave = $this->valorReal($usuario) && $this->valorReal($secreto);
        $mail->SMTPAuth = $hayClave;
        if ($hayClave) {
            $mail->Username = (string) $usuario;
            $mail->Password = (string) $secreto;
        }

        $esquema = (string) config('mail.mailers.smtp.scheme');
        if ($esquema === 'smtps' || $mail->Port === 465) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } elseif ($esquema === 'smtp' || $mail->Port === 587) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        } else {
            $mail->SMTPAutoTLS = false;
            $mail->SMTPSecure = false;
        }

        $desde = (string) config('mail.from.address');
        $nombreDesde = (string) config('mail.from.name', 'THE ROOKIE');
        if (! $this->valorReal($desde)) {
            $desde = 'rookie@localhost';
        }

        $mail->setFrom($desde, $nombreDesde !== '' ? $nombreDesde : 'THE ROOKIE');
        $mail->addAddress($email, $nombre);
        $mail->Subject = $mensaje['asunto'];
        $mail->isHTML(true);
        $mail->Body = $mensaje['html'];
        $mail->AltBody = $mensaje['texto'];

        try {
            $mail->send();
        } catch (Throwable $falla) {
            throw new \RuntimeException('No pude enviar el correo de bienvenida.', 0, $falla);
        }
    }

    private function valorReal(mixed $valor): bool
    {
        if (! is_string($valor)) {
            return false;
        }

        $limpio = strtolower(trim($valor));

        return $limpio !== '' && $limpio !== 'null';
    }
}
