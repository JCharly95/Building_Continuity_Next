import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Crear el endpoint de acceso para solicitar el envio del correo
export async function POST(request){
    // Con las peticiones que se envian datos (que no son get) se debe hacer una consulta asincrona para obtener la informacion enviada
    let datos = await request.json();
    let nombre = datos.nomPerso,
    apePat = datos.apelliPater,
    dirEnvio = datos.direCorreo,
    contra = datos.valContra;

    /** Objeto de transporte nodemailer para el correo */
    const objTransporEma = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            //servername: 'smtp.gmail.com'
            rejectUnauthorized: false
        }
        /*pool: true,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        tls: {
            servername: 'smtp.gmail.com'
        },
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
        pool: true,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        tls: {
            servername: 'smtp.gmail.com',
        }*/
    });

    /* Revisar este link para ver la configuracion de envio de informacion, porque google detecto certificado autofirmado
    https://github.com/nodemailer/nodemailer/issues/1429
    Y este otro link fue para ver lo de la optimizacion de imagen del perfil usando el recurso Image
    https://stackoverflow.com/questions/71193298/nextjs-image-an-issue-with-loader-property-that-does-not-implement-width
    */

    /** Objeto de configuración y contenido del correo a enviar */
    const objConfigCor = {
        from: process.env.EMAIL_USER,
        to: dirEnvio,
        subject: `Recuperación de Acceso para ${nombre} ${apePat}`,
        html: `<p style="text-justify=distribute;">
            Buen día estimado usuario.<br><br>
            Este correo fue enviado, ya que, el usuario <strong>${nombre} ${apePat}</strong> solicitó la recuperación de contraseña en el sistema <strong>Building Continuity</strong> y por este medio se le hace llegar la información que se incluye a continuación:<br><br>
            &emsp;&emsp;<strong>Datos de Acceso del usuario:</strong><br><br>
            &emsp;&emsp;<strong>Dirección de Correo: </strong>${dirEnvio}<br><br>
            &emsp;&emsp;<strong>Contraseña: </strong>${contra}<br><br>
            Gracias por su atención y que tenga buen día.<br><br>
            <strong>NOTA: Si no fue usted quien solicitó la recuperación, favor de contactar con el administrador para obtener más información acerca de su cuenta.</strong><br><br>
            <strong>Favor de NO responder a este correo</strong>, ya que, es un medio únicamente informativo.
        </p>`
    };

    //console.info('Enviando correo ...');
    // Enviar el correo y establecer la respuesta al cliente en base al resultado del proceso de envio
    try {
        const peticion = await objTransporEma.sendMail(objConfigCor);
        console.log(`Correo enviado; Respuesta: ${peticion.response}`);
        return NextResponse.json({ results: `Favor de revisar su correo para consultar su información.` }, {
            status: 200,
            headers: {
                'content-type': 'application/json'
            }
        });
    }catch(error){
        console.log(error);
        return NextResponse.json({ msgError: `El correo de recuperación no pudo ser enviado. Causa: ${error}` }, {
            status: 500,
            headers: {
                'content-type': 'application/json'
            }
        });
    }

    /*objTransporEma.sendMail(objConfigCor, (error, info) => {
        if(error){
            console.log(error);
            return NextResponse.json({ msgError: `El correo de recuperación no pudo ser enviado` }, {
                status: 500,
                headers: {
                    'content-type': 'application/json'
                }
            });
        }else{
            console.log('Enviado! ' + info.response);
            return NextResponse.json({ results: `Correo enviado. Favor de revisar su correo para consultar su información` }, {
                status: 200,
                headers: {
                    'content-type': 'application/json'
                }
            });
        }
    });*/
}

/* Revisar la configuracion de la cuenta de google, porque se necesitaria configurar acceso externo a la cuenta de correo
// https://medium.com/nerd-for-tech/c%C3%B3mo-enviar-emails-en-node-js-sin-tanto-rollo-53b7b1738b8a

const transportador = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tucorreo', //Tu cuenta de gmail
        pass: 'tucontraseña' //Aqui va la contraseña que generamos en el paso anterior de gmail
    }
});

const correoOpcs = {
    from: 'tucorreo', //tu cuenta de gmail
    to: 'elcorreoquequierasenviarle', //Un ejemplo de correo al que quieres que llegue tu email
    subject: 'Correo de prueba desde Node', //Cabecera
    text: '¡Hola!', //texto a enviar
    html: "<b>Hello world?</b>", // elemento html, si es que se desea enviar
};

console.info('Enviando correo ...');
transportador.sendMail(correoOpcs, (error, info) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Enviado! ' + info.response);
    }
});*/
