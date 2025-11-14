import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Mail, MapPin } from 'lucide-react';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/logo.svg" 
                alt="PowerGym AG" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold text-powergym-charcoal">PowerGym AG</span>
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Volver al inicio</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-card p-8 md:p-12 border border-neutral-200">
          <h1 className="text-4xl md:text-5xl font-bold text-powergym-charcoal mb-4">
            Política de Privacidad
          </h1>
          <p className="text-neutral-600 mb-8 text-lg">
            <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>

          <div className="prose prose-neutral max-w-none space-y-8">
            {/* Introducción */}
            <section>
              <p className="text-lg text-neutral-700 leading-relaxed mb-4">
                Esta Política de Privacidad describe cómo <strong>PowerGym AG</strong> recopila, 
                utiliza y comparte su información personal cuando utiliza nuestro sistema de gestión 
                para la administración de membresías, asistencias y servicios de nuestro gimnasio físico 
                ubicado en Guayabal, Armero, Tolima, Colombia (denominado en lo sucesivo el &quot;Sitio&quot; 
                o el &quot;Servicio&quot;).
              </p>
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 mt-4">
                <p className="text-neutral-700 leading-relaxed">
                  <strong>Nota importante:</strong> Esta es una solución de gestión desarrollada específicamente 
                  para nuestro gimnasio físico. No es una plataforma SaaS pública ni una tienda online, 
                  sino un sistema interno para la gestión de nuestros clientes y miembros del gimnasio.
                </p>
              </div>
            </section>

            {/* Información que recopilamos */}
            <section>
              <h2 className="text-2xl font-bold text-powergym-charcoal mt-8 mb-4">
                INFORMACIÓN PERSONAL QUE RECOPILAMOS
              </h2>
              
              <h3 className="text-xl font-semibold text-powergym-charcoal mt-6 mb-3">
                Información que usted nos proporciona
              </h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Cuando se registra como miembro de nuestro gimnasio o utiliza nuestro sistema de gestión, 
                recopilamos la siguiente información personal necesaria para administrar su membresía:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 text-neutral-700 mb-4">
                <li><strong>Información de identificación:</strong> Nombre completo, número de documento de identidad, fecha de nacimiento</li>
                <li><strong>Información de contacto:</strong> Dirección de correo electrónico, número de teléfono (incluyendo número de WhatsApp para notificaciones)</li>
                <li><strong>Información de membresía:</strong> Tipo de plan o suscripción seleccionada, fecha de inicio de la membresía, estado de la suscripción, fecha de vencimiento</li>
                <li><strong>Información de pago:</strong> Historial de pagos de membresías, métodos de pago utilizados, registros de transacciones (cuando corresponda)</li>
                <li><strong>Información de asistencia:</strong> Registro de check-ins, uso de las instalaciones, frecuencia de asistencia, historial de asistencias utilizado para calcular elegibilidad de recompensas</li>
                <li><strong>Información biométrica (opcional):</strong> En caso de que utilice nuestro sistema de reconocimiento facial para acceso al gimnasio, almacenamos datos biométricos de forma segura. Específicamente, almacenamos embeddings faciales (vectores numéricos de 512 dimensiones que representan características faciales únicas) y miniaturas encriptadas de su rostro. No almacenamos imágenes completas de su rostro, solo representaciones matemáticas que permiten la identificación segura.</li>
                <li><strong>Información de transacciones:</strong> Si realiza compras de productos en nuestro gimnasio, registramos información sobre las transacciones, productos adquiridos y empleado responsable de la venta (para efectos de gestión de inventario y contabilidad)</li>
                <li><strong>Información de emergencia:</strong> Contacto de emergencia y relación (cuando la proporcione)</li>
              </ul>
              
              <p className="text-neutral-700 leading-relaxed">
                Nos referimos a esta información como &quot;Información del miembro&quot; o &quot;Información de la membresía&quot;.
              </p>

              <h3 className="text-xl font-semibold text-powergym-charcoal mt-6 mb-3">
                Información que recopilamos automáticamente
              </h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Cuando utiliza nuestro sistema de gestión a través de nuestro sitio web o aplicación, 
                recopilamos automáticamente cierta información sobre su dispositivo, incluida información 
                sobre su navegador web, dirección IP, zona horaria y algunas de las cookies que están 
                instaladas en su dispositivo. Además, recopilamos información sobre cómo interactúa 
                usted con el Sitio. Nos referimos a esta información recopilada automáticamente como 
                &quot;Información del dispositivo&quot;.
              </p>

              <h3 className="text-xl font-semibold text-powergym-charcoal mt-6 mb-3">
                Tecnologías de recopilación
              </h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Recopilamos Información del dispositivo mediante el uso de las siguientes tecnologías:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                <li>
                  <strong>Cookies:</strong> Archivos de datos que se colocan en su dispositivo o 
                  computadora y que a menudo incluyen un identificador único anónimo. Utilizamos cookies 
                  para mantener su sesión activa y recordar sus preferencias.
                </li>
                <li>
                  <strong>Archivos de registro:</strong> Rastrean las acciones que ocurren en el Sitio 
                  y recopilan datos, incluyendo su dirección IP, tipo de navegador, proveedor de servicio 
                  de Internet, páginas de referencia/salida y marcas de fecha/horario.
                </li>
                <li>
                  <strong>Balizas web, etiquetas y píxeles:</strong> Archivos electrónicos utilizados 
                  para registrar información sobre cómo navega usted por el Sitio.
                </li>
                <li>
                  <strong>Tecnología de reconocimiento facial (InsightFace):</strong> Utilizamos el modelo 
                  InsightFace para procesar imágenes faciales y generar embeddings faciales (representaciones 
                  matemáticas de características faciales). Esta tecnología se utiliza únicamente para 
                  identificar miembros durante el check-in y control de acceso.
                </li>
                <li>
                  <strong>Almacenamiento vectorial (pgvector):</strong> Utilizamos bases de datos vectoriales 
                  para almacenar y buscar embeddings faciales de forma eficiente y segura, permitiendo la 
                  identificación rápida mediante comparación de similitud matemática.
                </li>
              </ul>

              <p className="text-neutral-700 leading-relaxed mt-4">
                Cuando hablamos de &quot;Información personal&quot; en la presente Política de privacidad, 
                nos referimos tanto a la Información del dispositivo como a la Información del miembro.
              </p>

              <h3 className="text-xl font-semibold text-powergym-charcoal mt-6 mb-3">
                Almacenamiento de datos biométricos
              </h3>
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 mt-4">
                <p className="text-neutral-700 leading-relaxed mb-3">
                  <strong>Seguridad y privacidad de sus datos biométricos:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                  <li>
                    <strong>No almacenamos imágenes completas:</strong> No guardamos fotografías completas de su 
                    rostro. En su lugar, utilizamos tecnología de reconocimiento facial (InsightFace) para generar 
                    embeddings faciales, que son representaciones matemáticas numéricas (vectores de 512 dimensiones) 
                    que codifican características faciales únicas. Estos embeddings no pueden ser utilizados para 
                    reconstruir su imagen original.
                  </li>
                  <li>
                    <strong>Miniaturas encriptadas:</strong> Almacenamos únicamente miniaturas encriptadas de su 
                    rostro, que se utilizan para referencia visual limitada y están protegidas mediante encriptación.
                  </li>
                  <li>
                    <strong>Almacenamiento seguro:</strong> Los embeddings faciales se almacenan en una base de datos 
                    vectorial (pgvector) con medidas de seguridad implementadas. Solo personal autorizado tiene acceso 
                    a estos datos, y únicamente para los fines de identificación y control de acceso.
                  </li>
                  <li>
                    <strong>Uso limitado:</strong> Sus datos biométricos se utilizan exclusivamente para identificarle 
                    durante el check-in y controlar el acceso a las instalaciones del gimnasio. No se utilizan para 
                    ningún otro propósito.
                  </li>
                  <li>
                    <strong>Derecho a eliminar:</strong> Puede solicitar la eliminación de sus datos biométricos en 
                    cualquier momento contactándonos a través de los medios indicados en esta política. Sin embargo, 
                    tenga en cuenta que esto puede afectar su capacidad de utilizar el sistema de reconocimiento facial 
                    para check-in.
                  </li>
                </ul>
              </div>
            </section>

            {/* Cómo utilizamos la información */}
            <section>
              <h2 className="text-2xl font-bold text-powergym-charcoal mt-8 mb-4">
                ¿CÓMO UTILIZAMOS SU INFORMACIÓN PERSONAL?
              </h2>
              
              <p className="text-neutral-700 leading-relaxed mb-4">
                Utilizamos la Información del miembro que recopilamos para:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-neutral-700 mb-6">
                <li>
                  <strong>Gestión de membresías:</strong> Administrar su membresía, procesar suscripciones, 
                  renovaciones y cancelaciones, y gestionar el acceso a nuestras instalaciones del gimnasio.
                </li>
                <li>
                  <strong>Control de acceso y reconocimiento facial:</strong> Verificar su identidad al ingresar 
                  al gimnasio mediante reconocimiento facial utilizando embeddings faciales almacenados. El sistema 
                  compara su rostro capturado en tiempo real con los embeddings almacenados para identificarle de 
                  forma segura y rápida, registrar su asistencia automáticamente y controlar el acceso basado en 
                  el estado de su suscripción.
                </li>
                <li>
                  <strong>Gestión de pagos:</strong> Procesar pagos de membresías, generar facturas, 
                  mantener registros financieros y contables, y gestionar renovaciones de suscripciones.
                </li>
                <li>
                  <strong>Sistema de recompensas basado en asistencia:</strong> Calcular automáticamente su 
                  elegibilidad para recompensas basadas en su frecuencia de asistencia. Si cumple con el umbral 
                  mínimo de asistencias (20 o más asistencias en un ciclo de suscripción mensual), el sistema 
                  genera automáticamente una recompensa que puede aplicar como descuento en su próxima suscripción. 
                  Utilizamos su historial de asistencias únicamente para este propósito.
                </li>
                <li>
                  <strong>Gestión de inventario y ventas:</strong> Registrar transacciones de productos cuando 
                  realiza compras en nuestro gimnasio, gestionar el inventario de productos, y mantener registros 
                  de ventas para efectos contables y de gestión operativa.
                </li>
                <li>
                  <strong>Estadísticas y análisis:</strong> Generar reportes y estadísticas sobre asistencia 
                  (por hora, día, semana), patrones de uso de las instalaciones, métricas de membresías, ingresos, 
                  y otros indicadores de gestión del gimnasio. Esta información se utiliza para mejorar nuestros 
                  servicios y tomar decisiones operativas.
                </li>
                <li>
                  <strong>Comunicación y notificaciones:</strong> Comunicarnos con usted sobre su cuenta, 
                  suscripciones, recordatorios de pago, cambios en horarios o servicios del gimnasio, 
                  y enviarle notificaciones automáticas por WhatsApp relacionadas con su membresía 
                  (incluyendo recordatorios de pago, confirmaciones de asistencia, y actualizaciones del servicio).
                </li>
                <li>
                  <strong>Seguridad:</strong> Garantizar la seguridad de nuestras instalaciones, detectar 
                  posibles riesgos y prevenir el uso no autorizado del servicio o acceso no permitido.
                </li>
                <li>
                  <strong>Mejora del servicio:</strong> Mejorar nuestros servicios, analizar patrones de 
                  uso y generar reportes internos de gestión del gimnasio.
                </li>
                <li>
                  <strong>Cumplimiento legal:</strong> Cumplir con las leyes y regulaciones aplicables en 
                  Colombia, incluyendo obligaciones fiscales y contables.
                </li>
              </ul>

              <p className="text-neutral-700 leading-relaxed mb-4">
                Utilizamos la Información del dispositivo que recopilamos para:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                <li>
                  Ayudarnos a detectar posibles riesgos y fraudes (en particular, su dirección IP).
                </li>
                <li>
                  Mejorar y optimizar nuestro sistema de gestión (por ejemplo, al generar informes y 
                  estadísticas sobre cómo nuestros miembros utilizan el sistema).
                </li>
                <li>
                  Mantener la seguridad y funcionalidad técnica del sistema.
                </li>
              </ul>
            </section>

            {/* Compartir información */}
            <section>
              <h2 className="text-2xl font-bold text-powergym-charcoal mt-8 mb-4">
                COMPARTIR SU INFORMACIÓN PERSONAL
              </h2>
              
              <p className="text-neutral-700 leading-relaxed mb-4">
                Compartimos su Información personal con terceros de confianza únicamente cuando es 
                necesario para proporcionar nuestros servicios de gestión del gimnasio:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-neutral-700 mb-4">
                <li>
                  <strong>Servicios de mensajería (WhatsApp Business API de Meta):</strong> Utilizamos 
                  la API de WhatsApp de Meta para enviarle notificaciones automáticas relacionadas con 
                  su membresía (recordatorios de pago, confirmaciones de asistencia, actualizaciones del 
                  servicio, etc.). Su número de teléfono se comparte con Meta únicamente para este 
                  propósito específico. Puede revisar la política de privacidad de WhatsApp/Meta en{' '}
                  <a 
                    href="https://www.whatsapp.com/legal/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    https://www.whatsapp.com/legal/privacy-policy
                  </a>.
                </li>
                <li>
                  <strong>Procesamiento de pagos:</strong> Utilizamos procesadores de pago seguros y 
                  certificados para gestionar transacciones de membresías cuando realiza pagos en línea 
                  o mediante otros métodos electrónicos.
                </li>
                <li>
                  <strong>Alojamiento en la nube:</strong> Utilizamos servicios de alojamiento en la nube 
                  seguros y certificados para almacenar y procesar sus datos de forma protegida y segura.
                </li>
              </ul>

              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100 mb-4">
                <p className="text-neutral-700 leading-relaxed font-semibold mb-2">
                  Importante:
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  <strong>No vendemos ni alquilamos</strong> su información personal a terceros para fines 
                  de marketing. Solo compartimos información cuando es estrictamente necesario para operar 
                  nuestro servicio de gestión del gimnasio o cuando la ley lo requiere.
                </p>
              </div>

              <p className="text-neutral-700 leading-relaxed">
                También podemos compartir su Información personal para cumplir con las leyes y 
                regulaciones aplicables en Colombia, para responder a una citación, orden de registro 
                u otra solicitud legal de información que recibamos, o para proteger nuestros derechos 
                y la seguridad de nuestros miembros y empleados.
              </p>
            </section>

            {/* Retención de datos */}
            <section>
              <h2 className="text-2xl font-bold text-powergym-charcoal mt-8 mb-4">
                RETENCIÓN DE DATOS
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Mantendremos su Información personal mientras tenga una membresía activa con nosotros 
                y durante un período razonable después de la finalización de la membresía para cumplir 
                con obligaciones legales, contables y fiscales según la ley colombiana.
              </p>
              <p className="text-neutral-700 leading-relaxed mb-4">
                <strong>Datos de asistencia y recompensas:</strong> Conservamos su historial de asistencias 
                para calcular su elegibilidad para recompensas basadas en asistencia y para generar estadísticas 
                y análisis de uso de las instalaciones. Estos datos se mantienen mientras sea necesario para 
                estos fines y para cumplir con obligaciones contables.
              </p>
              <p className="text-neutral-700 leading-relaxed mb-4">
                <strong>Datos biométricos:</strong> Sus embeddings faciales y miniaturas encriptadas se 
                conservan mientras tenga una membresía activa y utilice el sistema de reconocimiento facial. 
                Puede solicitar la eliminación de estos datos en cualquier momento, lo que puede afectar su 
                capacidad de utilizar el sistema de check-in facial.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Si solicita la eliminación de sus datos, eliminaremos o anonimizaremos su información 
                personal, excepto cuando estemos obligados legalmente a conservarla (por ejemplo, 
                registros contables para efectos fiscales, obligaciones legales, o para resolver disputas 
                pendientes). Los datos anonimizados pueden conservarse para análisis estadísticos agregados 
                que no permiten la identificación individual.
              </p>
            </section>

            {/* Derechos del usuario */}
            <section>
              <h2 className="text-2xl font-bold text-powergym-charcoal mt-8 mb-4">
                SUS DERECHOS
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                De acuerdo con la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong> 
                de Colombia sobre Protección de Datos Personales, usted tiene los siguientes derechos:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                <li>
                  <strong>Conocer, actualizar y rectificar:</strong> Acceder, actualizar y rectificar 
                  sus datos personales cuando sean inexactos, parciales o incompletos.
                </li>
                <li>
                  <strong>Solicitar prueba de autorización:</strong> Solicitar prueba de la autorización 
                  otorgada para el tratamiento de sus datos.
                </li>
                <li>
                  <strong>Revocar la autorización:</strong> Revocar la autorización y/o solicitar la 
                  supresión del dato cuando no se respeten los principios, derechos y garantías 
                  constitucionales y legales.
                </li>
                <li>
                  <strong>Acceso gratuito:</strong> Acceder de forma gratuita a sus datos personales 
                  que hayan sido objeto de tratamiento.
                </li>
                <li>
                  <strong>Presentar quejas ante la SIC:</strong> Presentar ante la Superintendencia 
                  de Industria y Comercio (SIC) quejas por infracciones a la normatividad de protección 
                  de datos. Puede encontrar más información en{' '}
                  <a 
                    href="https://www.sic.gov.co" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    https://www.sic.gov.co
                  </a>.
                </li>
              </ul>
              
              <p className="text-neutral-700 leading-relaxed mt-4">
                Estos derechos pueden ejercerse contactándonos a través de los medios indicados en 
                la sección &quot;CÓMO SOLICITAR LA ELIMINACIÓN DE SUS DATOS&quot; de esta política.
              </p>
            </section>

            {/* Eliminación de datos */}
            <section>
              <h2 className="text-2xl font-bold text-powergym-charcoal mt-8 mb-4">
                CÓMO SOLICITAR LA ELIMINACIÓN DE SUS DATOS
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Si desea ejercer sus derechos, incluyendo solicitar la eliminación de su información 
                personal, puede hacerlo de las siguientes maneras:
              </p>
              
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 mb-4">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-powergym-charcoal mb-2">Por correo electrónico:</p>
                    <a 
                      href="mailto:powergymag5@gmail.com?subject=Solicitud de eliminación o actualización de datos personales" 
                      className="text-primary-600 hover:text-primary-700 transition-colors break-all"
                    >
                      powergymag5@gmail.com
                    </a>
                    <p className="text-sm text-neutral-600 mt-2">
                      Por favor, incluya en el asunto: &quot;Solicitud de eliminación de datos personales&quot; 
                      o &quot;Solicitud de actualización de datos personales&quot;
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-powergym-charcoal mb-2">Por correo postal:</p>
                    <address className="text-neutral-700 not-italic">
                      PowerGym AG<br />
                      Cra. 6 #9-1 9-109 a<br />
                      Guayabal, Armero, Tolima<br />
                      Guayabal, TOL, 732060<br />
                      Colombia
                    </address>
                  </div>
                </div>
              </div>

              <p className="text-neutral-700 leading-relaxed mt-6">
                Responderemos a su solicitud en un plazo razonable y de acuerdo con las leyes 
                aplicables de protección de datos en Colombia. Le notificaremos sobre las acciones 
                tomadas en respuesta a su solicitud.
              </p>
            </section>

            {/* Menores de edad */}
            <section>
              <h2 className="text-2xl font-bold text-powergym-charcoal mt-8 mb-4">
                MENORES DE EDAD
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Nuestro gimnasio acepta miembros a partir de los <strong>14 años de edad</strong>. 
                Para menores de 18 años, requerimos el consentimiento explícito de un padre, madre 
                o tutor legal al momento del registro de la membresía.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Si usted es menor de 18 años, debe tener la autorización y consentimiento de su padre, 
                madre o tutor legal para proporcionarnos información personal y para utilizar nuestros 
                servicios. No recopilamos información personal de menores de 14 años. Los padres o 
                tutores pueden ejercer los derechos de los menores contactándonos a través de los 
                medios indicados en esta política.
              </p>
            </section>

            {/* Cambios */}
            <section>
              <h2 className="text-2xl font-bold text-powergym-charcoal mt-8 mb-4">
                CAMBIOS
              </h2>
              <p className="text-neutral-700 leading-relaxed">
                Podemos actualizar esta política de privacidad periódicamente para reflejar, por ejemplo, 
                cambios en nuestras prácticas o por otros motivos operativos, legales o reglamentarios. 
                Le notificaremos de cualquier cambio significativo publicando la nueva política de 
                privacidad en esta página y actualizando la fecha de &quot;Última actualización&quot;. 
                En caso de cambios sustanciales, también podemos notificarlo mediante otros medios, 
                como correo electrónico o notificaciones a través de nuestro sistema.
              </p>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-2xl font-bold text-powergym-charcoal mt-8 mb-4">
                CONTÁCTENOS
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Para obtener más información sobre nuestras prácticas de privacidad, si tiene alguna pregunta, 
                si desea ejercer sus derechos, o si desea presentar una queja, contáctenos:
              </p>
              
              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
                <p className="font-semibold text-powergym-charcoal mb-4 text-lg">PowerGym AG</p>
                <div className="space-y-3 text-neutral-700">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <a 
                      href="mailto:powergymag5@gmail.com" 
                      className="text-primary-600 hover:text-primary-700 transition-colors break-all"
                    >
                      powergymag5@gmail.com
                    </a>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary-600 mt-1 flex-shrink-0" />
                    <address className="not-italic">
                      Cra. 6 #9-1 9-109 a<br />
                      Guayabal, Armero, Tolima<br />
                      Guayabal, TOL, 732060<br />
                      Colombia
                    </address>
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-200 text-center">
            <Link to="/">
              <Button variant="outline" size="lg">
                <ArrowLeft className="mr-2 w-5 h-5" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-powergym-charcoal text-neutral-300 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} PowerGym AG. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
