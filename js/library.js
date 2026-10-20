/*
 * Built-in library of common immigration client tasks.
 * EVERY ITEM IS AN EXAMPLE TEMPLATE. The attorney must review wording, legal
 * accuracy, and fit for each client before sending. Not legal advice.
 *
 * Phone numbers / URLs marked `verified` were checked against the official
 * agency page listed in `source` on 2026-10-19. Anything marked
 * `placeholder: true` must be filled in by the attorney (or client).
 *
 * Template text may contain {{fieldKey}} blanks; see FIELD_DEFS.
 */
(function (global) {
  'use strict';

  var VERIFIED_ON = '2026-10-19';

  // Fill-in fields the client can type once and reuse across tasks.
  var FIELD_DEFS = {
    fullName:      { en: 'Your full legal name', es: 'Su nombre legal completo' },
    dob:           { en: 'Your date of birth', es: 'Su fecha de nacimiento' },
    birthPlace:    { en: 'City and country where you were born', es: 'Ciudad y país donde nació' },
    parentsNames:  { en: "Your parents' full names (mother's maiden name)", es: 'Nombres completos de sus padres (apellido de soltera de su madre)' },
    address:       { en: 'Your mailing address', es: 'Su dirección postal' },
    phone:         { en: 'Your phone number', es: 'Su número de teléfono' },
    email:         { en: 'Your email address', es: 'Su correo electrónico' },
    aNumber:       { en: 'Your A-Number (if you have one)', es: 'Su número A (si tiene uno)' },
    receiptNumber: { en: 'USCIS receipt number', es: 'Número de recibo de USCIS' },
    spouseName:    { en: "Your spouse's full name", es: 'Nombre completo de su cónyuge' },
    marriageDate:  { en: 'Date of marriage', es: 'Fecha de matrimonio' },
    marriagePlace: { en: 'City/county and state of marriage', es: 'Ciudad/condado y estado del matrimonio' },
    employerName:  { en: 'Employer name', es: 'Nombre del empleador' },
    jobTitle:      { en: 'Your job title', es: 'Su puesto de trabajo' },
    startDate:     { en: 'Date you started working there', es: 'Fecha en que empezó a trabajar allí' },
    schoolName:    { en: 'School name', es: 'Nombre de la escuela' },
    schoolDates:   { en: 'Years you attended', es: 'Años en que asistió' },
    courtName:     { en: 'Court name and county', es: 'Nombre del tribunal y condado' },
    caseNumber:    { en: 'Court case number (if known)', es: 'Número del caso judicial (si lo sabe)' },
    arrestDate:    { en: 'Approximate date of arrest/ticket', es: 'Fecha aproximada del arresto/multa' },
    friendName:    { en: "Your friend or relative's name", es: 'Nombre de su amigo o familiar' },
    sponsorName:   { en: "Joint sponsor's name", es: 'Nombre del copatrocinador' },
    taxYears:      { en: 'Tax years needed', es: 'Años fiscales necesarios' },
    recordType:    { en: 'Record you need (e.g., birth certificate)', es: 'Documento que necesita (p. ej., acta de nacimiento)' },
    country:       { en: 'Country', es: 'País' }
  };

  function L(en, es) { return { en: en, es: es }; }

  var TYPES = {
    doc:    L('Gather a document', 'Reunir un documento'),
    email:  L('Request by email', 'Solicitar por correo electrónico'),
    phone:  L('Request by phone', 'Solicitar por teléfono'),
    online: L('Request online or by mail', 'Solicitar en línea o por correo postal'),
    custom: L('Task from your attorney', 'Tarea de su abogada')
  };

  var ITEMS = [
    /* ------------------------------ DOCUMENTS ------------------------------ */
    {
      id: 'birth_cert', type: 'doc', keywords: ['birth certificate', 'birth cert', 'acta de nacimiento', 'partida de nacimiento'],
      title: L('Your birth certificate', 'Su acta de nacimiento'),
      summary: L('A full copy of your birth certificate, showing your name, date and place of birth, and your parents\' names.',
                 'Una copia completa de su acta de nacimiento que muestre su nombre, fecha y lugar de nacimiento y los nombres de sus padres.'),
      where: [
        L('If you were born outside the U.S.: the civil registry (Registro Civil) in your country, or your country\'s consulate in the U.S.',
          'Si nació fuera de EE. UU.: el Registro Civil de su país o el consulado de su país en EE. UU.'),
        L('If you were born in the U.S.: the vital records office of the state where you were born.',
          'Si nació en EE. UU.: la oficina de registros vitales del estado donde nació.'),
        L('Check your own files first — family members often keep a copy.',
          'Revise primero sus papeles — a veces algún familiar guarda una copia.')
      ],
      accepted: [
        L('Long-form/full certified copy (preferred)', 'Copia certificada completa o "literal" (preferida)'),
        L('If it does not exist: an official statement that it is unavailable, plus other proof your attorney will explain (for example baptism or early school records)',
          'Si no existe: una constancia oficial de que no está disponible, y otras pruebas que su abogada le explicará (por ejemplo, fe de bautismo o registros escolares)')
      ],
      tips: [
        L('If it is not in English, tell us — it will need a certified English translation.', 'Si no está en inglés, avísenos — necesitará una traducción certificada al inglés.'),
        L('Check that every name and date is spelled correctly.', 'Revise que todos los nombres y fechas estén bien escritos.')
      ],
      links: [{ label: L('U.S. State Dept: civil documents by country', 'Depto. de Estado: documentos civiles por país'), url: 'https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country.html', verified: true }]
    },
    {
      id: 'passport_copy', type: 'doc', keywords: ['passport', 'pasaporte'],
      title: L('Copy of your passport', 'Copia de su pasaporte'),
      summary: L('A clear copy of the photo page and every page that has a stamp or visa.', 'Una copia clara de la página con su foto y de todas las páginas que tengan sellos o visas.'),
      where: [L('Your current passport and any old/expired passports.', 'Su pasaporte actual y cualquier pasaporte viejo o vencido.')],
      accepted: [
        L('Photo (biographic) page — required', 'Página con su foto y datos — obligatoria'),
        L('Pages with U.S. visas, entry stamps, or other stamps', 'Páginas con visas de EE. UU., sellos de entrada u otros sellos'),
        L('No passport? Tell us. A national ID card or consular ID may help in the meantime.', '¿No tiene pasaporte? Avísenos. Mientras tanto, puede servir una cédula de identidad o matrícula consular.')
      ],
      tips: [L('Photos taken with your phone are fine if every corner is visible and the text is sharp.', 'Las fotos con su teléfono sirven si se ven las cuatro esquinas y el texto se lee bien.')]
    },
    {
      id: 'marriage_cert', type: 'doc', keywords: ['marriage certificate', 'marriage cert', 'acta de matrimonio'],
      title: L('Your marriage certificate', 'Su acta de matrimonio'),
      summary: L('The official certificate issued by the government office where you married (not the decorative ceremony certificate).',
                 'El acta oficial emitida por la oficina del gobierno donde se casó (no el certificado decorativo de la ceremonia).'),
      where: [
        L('Married in the U.S.: the county clerk or vital records office of the county/state where you married.', 'Casado en EE. UU.: la oficina del secretario del condado o de registros vitales del condado/estado donde se casó.'),
        L('Married abroad: the civil registry of that country.', 'Casado en otro país: el Registro Civil de ese país.')
      ],
      accepted: [L('Certified copy from the issuing office', 'Copia certificada de la oficina que la emitió')],
      tips: [L('If you don\'t have it, see the task "Request a certified marriage certificate" — we can draft that email for you.', 'Si no la tiene, vea la tarea "Solicitar un acta de matrimonio certificada" — le preparamos el correo.')],
      links: [{ label: L('CDC: Where to Write for Vital Records (U.S.)', 'CDC: Dónde solicitar registros vitales (EE. UU.)'), url: 'https://www.cdc.gov/nchs/w2w/index.htm', verified: true }]
    },
    {
      id: 'prior_marriage_end', type: 'doc', keywords: ['divorce', 'prior marriage', 'divorcio', 'death certificate'],
      title: L('Proof that any earlier marriages ended', 'Prueba de que sus matrimonios anteriores terminaron'),
      summary: L('Only if you or your spouse were married before: the final divorce decree, annulment, or death certificate for each earlier marriage.',
                 'Solo si usted o su cónyuge estuvieron casados antes: la sentencia final de divorcio, anulación o acta de defunción de cada matrimonio anterior.'),
      where: [L('The court that granted the divorce, or the civil registry.', 'El tribunal que otorgó el divorcio o el Registro Civil.')],
      accepted: [L('Final divorce decree (not just the petition)', 'Sentencia final de divorcio (no solo la demanda)'), L('Annulment order', 'Orden de anulación'), L('Death certificate of the former spouse', 'Acta de defunción del excónyuge')],
      tips: [L('If neither of you was married before, mark this done and tell us.', 'Si ninguno de los dos estuvo casado antes, márquela como hecha y avísenos.')]
    },
    {
      id: 'joint_financial', type: 'doc', keywords: ['joint financial', 'joint bank', 'joint account', 'bona fide', 'lease', 'cuenta conjunta', 'documentos financieros'],
      title: L('Joint financial documents', 'Documentos financieros en conjunto'),
      summary: L('Papers that show you and your spouse share a life: accounts, home, bills, insurance.', 'Papeles que muestran que usted y su cónyuge comparten su vida: cuentas, hogar, facturas, seguros.'),
      where: [L('Your bank\'s app or website (download statements as PDF), your landlord, your insurance company.', 'La aplicación o página web de su banco (descargue estados de cuenta en PDF), su arrendador, su compañía de seguros.')],
      accepted: [
        L('Joint bank or credit card statements (a few months, spread over time)', 'Estados de cuenta bancarios o de tarjeta en conjunto (varios meses, en distintas fechas)'),
        L('Lease or mortgage with both names', 'Contrato de renta o hipoteca con los dos nombres'),
        L('Utility bills with both names or the same address', 'Facturas de servicios con los dos nombres o la misma dirección'),
        L('Health, car, or life insurance listing each other', 'Seguro médico, de auto o de vida donde aparezcan ambos'),
        L('Joint tax returns', 'Declaraciones de impuestos en conjunto')
      ],
      tips: [L('Several different types are better than many of the same type.', 'Es mejor tener varios tipos diferentes que muchos del mismo tipo.')]
    },
    {
      id: 'relationship_photos', type: 'doc', keywords: ['photos together', 'relationship photos', 'fotos juntos'],
      title: L('Photos of you together', 'Fotos de ustedes juntos'),
      summary: L('10–20 photos over the course of your relationship, with family and friends when possible.', 'De 10 a 20 fotos a lo largo de su relación, con familia y amigos cuando sea posible.'),
      where: [L('Your phone, social media, family albums.', 'Su teléfono, redes sociales, álbumes familiares.')],
      accepted: [L('Printed or digital photos; write the date, place, and who is in each one', 'Fotos impresas o digitales; anote la fecha, el lugar y quiénes aparecen')],
      tips: [L('Include different years and events (holidays, trips, wedding).', 'Incluya distintos años y eventos (fiestas, viajes, boda).')]
    },
    {
      id: 'passport_photos', type: 'doc', keywords: ['passport photos', 'photos 2x2', '2x2', 'fotos tamaño pasaporte'],
      title: L('Two passport-style photos', 'Dos fotos tamaño pasaporte'),
      summary: L('Two identical 2×2 inch color photos taken recently, white background.', 'Dos fotos a color idénticas de 2×2 pulgadas, recientes, con fondo blanco.'),
      where: [L('Most pharmacies and post offices take passport photos.', 'La mayoría de las farmacias y oficinas de correo toman fotos de pasaporte.')],
      accepted: [L('Taken within the last 30 days; no glasses', 'Tomadas en los últimos 30 días; sin lentes')],
      tips: [L('Write your name lightly in pencil on the back.', 'Escriba su nombre suavemente con lápiz en la parte de atrás.')]
    },
    {
      id: 'immigration_docs', type: 'doc', keywords: ['i-94', 'immigration documents', 'work permit', 'ead', 'green card copy', 'approval notice', 'documentos migratorios', 'permiso de trabajo'],
      title: L('All your past immigration papers', 'Todos sus documentos migratorios anteriores'),
      summary: L('Anything you have ever received from immigration: notices, cards, visas, I-94 records.', 'Todo lo que haya recibido de inmigración: avisos, tarjetas, visas, registros I-94.'),
      where: [L('Your files at home, your USCIS online account, and the CBP I-94 website.', 'Sus papeles en casa, su cuenta en línea de USCIS y la página web del I-94 de CBP.')],
      accepted: [
        L('Receipt and approval notices (Form I-797)', 'Avisos de recibo y aprobación (Formulario I-797)'),
        L('Work permits (EAD), green cards, travel documents — front and back', 'Permisos de trabajo (EAD), tarjetas de residencia, permisos de viaje — por ambos lados'),
        L('I-94 arrival record', 'Registro de entrada I-94'),
        L('Any court or ICE papers', 'Cualquier documento de la corte o de ICE')
      ],
      tips: [L('Bring everything, even if you are not sure it matters. We will sort it.', 'Traiga todo, aunque no esté seguro de que sirva. Nosotros lo revisamos.')],
      links: [{ label: L('CBP: Get your I-94', 'CBP: Obtenga su I-94'), url: 'https://i94.cbp.dhs.gov/', verified: false }]
    },
    {
      id: 'income_docs', type: 'doc', keywords: ['pay stubs', 'w-2', 'w2', 'income', 'talones de pago'],
      title: L('Proof of income (sponsor)', 'Prueba de ingresos (patrocinador)'),
      summary: L('For the person sponsoring: recent pay stubs and W-2s, or other proof of income.', 'Para la persona que patrocina: talones de pago recientes y formularios W-2, u otra prueba de ingresos.'),
      where: [L('Your employer\'s payroll portal or HR office; your tax preparer.', 'El portal de nómina o la oficina de recursos humanos de su empleador; su preparador de impuestos.')],
      accepted: [L('Pay stubs from the last 6 months', 'Talones de pago de los últimos 6 meses'), L('W-2s / 1099s for the most recent tax year', 'W-2 / 1099 del año fiscal más reciente'), L('Self-employed: profit/loss statement and bank statements', 'Trabajo por cuenta propia: estado de pérdidas y ganancias y estados bancarios')],
      tips: [L('Tax transcripts from the IRS are a separate task.', 'Las transcripciones de impuestos del IRS son otra tarea.')]
    },
    {
      id: 'daca_residence', type: 'doc', keywords: ['continuous residence', 'proof of residence', 'daca', 'residencia continua'],
      title: L('Proof you have lived in the U.S. (recent period)', 'Prueba de que ha vivido en EE. UU. (período reciente)'),
      summary: L('Documents with your name and a date that show you lived in the U.S. since your last application.', 'Documentos con su nombre y una fecha que muestren que ha vivido en EE. UU. desde su última solicitud.'),
      where: [L('Your employer, school, bank, doctor, landlord, phone company.', 'Su empleador, escuela, banco, médico, arrendador, compañía de teléfono.')],
      accepted: [L('Pay stubs or W-2s', 'Talones de pago o W-2'), L('School transcripts', 'Expedientes escolares'), L('Lease, utility, or phone bills', 'Contrato de renta, facturas de servicios o de teléfono'), L('Medical or bank records', 'Registros médicos o bancarios')],
      tips: [L('Try to have at least one document for every few months — no long gaps.', 'Trate de tener al menos un documento cada pocos meses, sin huecos largos.')]
    },

    /* -------------------------------- EMAIL -------------------------------- */
    {
      id: 'employment_letter', type: 'email', keywords: ['employment letter', 'employer letter', 'job letter', 'carta de empleo', 'carta del trabajo'],
      title: L('Ask your employer for an employment letter', 'Pida a su empleador una carta de empleo'),
      summary: L('A letter on company letterhead confirming your job, start date, and pay.', 'Una carta con el membrete de la empresa que confirme su puesto, fecha de inicio y salario.'),
      toLabel: L('Your HR department or manager', 'Su departamento de recursos humanos o su jefe'),
      fields: ['fullName', 'employerName', 'jobTitle', 'startDate', 'phone'],
      subject: L('Request for employment verification letter – {{fullName}}', 'Request for employment verification letter – {{fullName}}'),
      body: L(
        'Hello,\n\nI am writing to request an employment verification letter for an immigration application. Could you please provide a signed letter on {{employerName}} letterhead that includes:\n\n- My full name: {{fullName}}\n- My job title: {{jobTitle}}\n- My start date: {{startDate}}\n- Whether I work full-time or part-time, and my current salary or hourly pay\n- The name, title, and phone number of the person signing\n\nA scanned PDF by email is fine. If possible, I would appreciate it within the next week.\n\nThank you very much for your help.\n\n{{fullName}}\n{{phone}}',
        'Hello,\n\nI am writing to request an employment verification letter for an immigration application. Could you please provide a signed letter on {{employerName}} letterhead that includes:\n\n- My full name: {{fullName}}\n- My job title: {{jobTitle}}\n- My start date: {{startDate}}\n- Whether I work full-time or part-time, and my current salary or hourly pay\n- The name, title, and phone number of the person signing\n\nA scanned PDF by email is fine. If possible, I would appreciate it within the next week.\n\nThank you very much for your help.\n\n{{fullName}}\n{{phone}}'),
      bodyNote: L('', 'Este correo está en inglés porque lo leerá su empleador. Así dice: le pide una carta firmada con su nombre, puesto, fecha de inicio, horario y salario.'),
      tips: [L('Forward the letter to your attorney as soon as you receive it.', 'Reenvíe la carta a su abogada en cuanto la reciba.')]
    },
    {
      id: 'school_letter', type: 'email', keywords: ['school letter', 'school records', 'transcript school', 'registrar', 'carta de la escuela', 'expediente escolar'],
      title: L('Ask your school for records', 'Pida sus registros a la escuela'),
      summary: L('An official transcript or attendance letter from a school you attended.', 'Un expediente oficial o una carta de asistencia de una escuela a la que asistió.'),
      toLabel: L('The school registrar / records office', 'La oficina de registros de la escuela'),
      fields: ['fullName', 'dob', 'schoolName', 'schoolDates', 'address', 'phone'],
      subject: L('Records request – {{fullName}} ({{schoolDates}})', 'Records request – {{fullName}} ({{schoolDates}})'),
      body: L(
        'Hello,\n\nI am a former student of {{schoolName}} and I need my records for an immigration application. Could you please send me:\n\n- An official transcript, and\n- A letter confirming my dates of attendance\n\nMy information:\nName while enrolled: {{fullName}}\nDate of birth: {{dob}}\nYears attended: {{schoolDates}}\nMailing address: {{address}}\nPhone: {{phone}}\n\nPlease let me know if there is a form to fill out or a fee to pay.\n\nThank you,\n{{fullName}}',
        'Hello,\n\nI am a former student of {{schoolName}} and I need my records for an immigration application. Could you please send me:\n\n- An official transcript, and\n- A letter confirming my dates of attendance\n\nMy information:\nName while enrolled: {{fullName}}\nDate of birth: {{dob}}\nYears attended: {{schoolDates}}\nMailing address: {{address}}\nPhone: {{phone}}\n\nPlease let me know if there is a form to fill out or a fee to pay.\n\nThank you,\n{{fullName}}'),
      bodyNote: L('', 'Este correo está en inglés porque lo leerá la escuela. Pide su expediente oficial y una carta con las fechas en que asistió.'),
      tips: [L('Many schools have an online records request form — if the reply points you there, use it.', 'Muchas escuelas tienen un formulario en línea — si le responden con un enlace, úselo.')]
    },
    {
      id: 'affidavit_request', type: 'email', keywords: ['affidavit', 'support letter', 'declaración jurada', 'carta de apoyo'],
      title: L('Ask a friend or relative for a support letter', 'Pida una carta de apoyo a un amigo o familiar'),
      summary: L('A signed letter from someone who knows you as a couple, describing your relationship.', 'Una carta firmada por alguien que los conoce como pareja, describiendo su relación.'),
      toLabel: L('A friend or relative who knows you both', 'Un amigo o familiar que los conozca a los dos'),
      fields: ['friendName', 'fullName', 'spouseName'],
      subject: L('A favor: letter about {{fullName}} and {{spouseName}}', 'Un favor: carta sobre {{fullName}} y {{spouseName}}'),
      body: L(
        'Hi {{friendName}},\n\nI hope you are well! {{spouseName}} and I are working on my immigration case, and a letter from you about our relationship would really help.\n\nIf you are willing, please write a short letter that includes:\n- Your full name, address, date and place of birth\n- How you know us and for how long\n- Things you have seen that show our relationship is real (visits, holidays, how we live together)\n- Your signature and the date at the end\n- A copy of your ID or passport\n\nIt does not have to be fancy — just honest and in your own words. Thank you so much!\n\n{{fullName}}',
        'Hola {{friendName}}:\n\n¡Espero que estés bien! {{spouseName}} y yo estamos trabajando en mi caso de inmigración, y una carta tuya sobre nuestra relación nos ayudaría mucho.\n\nSi estás dispuesto/a, por favor escribe una carta corta que incluya:\n- Tu nombre completo, dirección, fecha y lugar de nacimiento\n- Cómo nos conoces y desde hace cuánto tiempo\n- Cosas que has visto que muestran que nuestra relación es real (visitas, fiestas, cómo vivimos juntos)\n- Tu firma y la fecha al final\n- Una copia de tu identificación o pasaporte\n\nNo tiene que ser elegante — solo honesta y con tus propias palabras. ¡Muchas gracias!\n\n{{fullName}}'),
      tips: [L('Ask your attorney whether the letter must be notarized or in English.', 'Pregunte a su abogada si la carta debe estar notarizada o en inglés.')]
    },
    {
      id: 'marriage_cert_request', type: 'email', keywords: ['request marriage certificate', 'county clerk', 'secretario del condado'],
      title: L('Request a certified marriage certificate', 'Solicite un acta de matrimonio certificada'),
      summary: L('Ask the county clerk where you married for a certified copy.', 'Pida una copia certificada a la oficina del condado donde se casó.'),
      toLabel: L('County clerk / vital records office where you married', 'Oficina del secretario del condado / registros vitales donde se casó'),
      placeholderTo: true,
      fields: ['fullName', 'spouseName', 'marriageDate', 'marriagePlace', 'address', 'phone'],
      subject: L('Request for certified marriage certificate – {{fullName}} and {{spouseName}}', 'Request for certified marriage certificate – {{fullName}} and {{spouseName}}'),
      body: L(
        'Hello,\n\nI would like to order a certified copy of my marriage certificate.\n\nFull names of both spouses: {{fullName}} and {{spouseName}}\nDate of marriage: {{marriageDate}}\nPlace of marriage: {{marriagePlace}}\nPurpose: immigration application\nRelationship: I am one of the spouses\nMailing address: {{address}}\nDaytime phone: {{phone}}\n\nPlease let me know the fee, accepted payment methods, and whether you need an application form or a copy of my ID.\n\nThank you,\n{{fullName}}',
        'Hello,\n\nI would like to order a certified copy of my marriage certificate.\n\nFull names of both spouses: {{fullName}} and {{spouseName}}\nDate of marriage: {{marriageDate}}\nPlace of marriage: {{marriagePlace}}\nPurpose: immigration application\nRelationship: I am one of the spouses\nMailing address: {{address}}\nDaytime phone: {{phone}}\n\nPlease let me know the fee, accepted payment methods, and whether you need an application form or a copy of my ID.\n\nThank you,\n{{fullName}}'),
      bodyNote: L('', 'Este correo está en inglés porque lo leerá la oficina del condado. Pide una copia certificada de su acta de matrimonio y pregunta el costo y los requisitos.'),
      tips: [L('Find the office for your state/county on the CDC "Where to Write for Vital Records" page.', 'Busque la oficina de su estado/condado en la página de los CDC "Where to Write for Vital Records".')],
      links: [{ label: L('CDC: Where to Write for Vital Records', 'CDC: Dónde solicitar registros vitales'), url: 'https://www.cdc.gov/nchs/w2w/index.htm', verified: true }]
    },
    {
      id: 'court_records', type: 'email', keywords: ['court records', 'court disposition', 'disposition', 'arrest', 'police report', 'registros de la corte', 'arresto'],
      title: L('Request court records (certified disposition)', 'Solicite registros de la corte (disposición certificada)'),
      summary: L('If you were ever arrested, cited, or charged: the final result of each case from the court.', 'Si alguna vez fue arrestado, multado o acusado: el resultado final de cada caso, del tribunal.'),
      toLabel: L('Clerk of the court that handled the case', 'Secretario del tribunal que llevó el caso'),
      placeholderTo: true,
      fields: ['fullName', 'dob', 'courtName', 'caseNumber', 'arrestDate', 'address', 'phone'],
      subject: L('Request for certified disposition – {{fullName}}, case {{caseNumber}}', 'Request for certified disposition – {{fullName}}, case {{caseNumber}}'),
      body: L(
        'Hello,\n\nI am requesting a certified copy of the final disposition for the following case:\n\nName: {{fullName}}\nDate of birth: {{dob}}\nCourt: {{courtName}}\nCase number: {{caseNumber}}\nApproximate date: {{arrestDate}}\n\nPlease let me know the fee and how to pay, and whether I can pick it up or receive it by mail at:\n{{address}}\n\nThank you,\n{{fullName}}\n{{phone}}',
        'Hello,\n\nI am requesting a certified copy of the final disposition for the following case:\n\nName: {{fullName}}\nDate of birth: {{dob}}\nCourt: {{courtName}}\nCase number: {{caseNumber}}\nApproximate date: {{arrestDate}}\n\nPlease let me know the fee and how to pay, and whether I can pick it up or receive it by mail at:\n{{address}}\n\nThank you,\n{{fullName}}\n{{phone}}'),
      bodyNote: L('', 'Este correo está en inglés porque lo leerá el tribunal. Pide una copia certificada del resultado final de su caso.'),
      tips: [L('Do this for every case, even if it was dismissed or very old. Please talk to your attorney before contacting police or court about anything else.', 'Hágalo para cada caso, aunque se haya desestimado o sea muy antiguo. Hable con su abogada antes de contactar a la policía o al tribunal sobre cualquier otra cosa.')]
    },
    {
      id: 'joint_sponsor', type: 'email', keywords: ['joint sponsor', 'co-sponsor', 'i-864', 'copatrocinador'],
      title: L('Ask your joint sponsor for their documents', 'Pida sus documentos a su copatrocinador'),
      summary: L('If someone else is helping sponsor you financially, they need to send their proof of income and status.', 'Si otra persona le ayuda a patrocinar económicamente, debe enviar su prueba de ingresos y estatus.'),
      toLabel: L('Your joint sponsor', 'Su copatrocinador'),
      fields: ['sponsorName', 'fullName'],
      subject: L('Documents needed for the affidavit of support', 'Documentos necesarios para la declaración de patrocinio'),
      body: L(
        'Hi {{sponsorName}},\n\nThank you again for agreeing to be my joint sponsor. My attorney needs the following from you:\n\n- Your most recent federal tax return or IRS tax transcript\n- Your W-2s/1099s for that year\n- Pay stubs from the last 6 months or a letter from your employer\n- Proof of U.S. citizenship or permanent residence (passport, birth certificate, naturalization certificate, or green card)\n\nYou can send clear photos or PDFs. My attorney\'s office may contact you to sign the form. Thank you!\n\n{{fullName}}',
        'Hola {{sponsorName}}:\n\nGracias de nuevo por aceptar ser mi copatrocinador. Mi abogada necesita lo siguiente:\n\n- Tu declaración de impuestos federal más reciente o la transcripción del IRS\n- Tus W-2/1099 de ese año\n- Talones de pago de los últimos 6 meses o una carta de tu empleador\n- Prueba de ciudadanía o residencia permanente (pasaporte, acta de nacimiento, certificado de naturalización o tarjeta de residencia)\n\nPuedes enviar fotos claras o PDFs. La oficina de mi abogada podría contactarte para firmar el formulario. ¡Gracias!\n\n{{fullName}}'),
      tips: []
    },

    /* -------------------------------- PHONE -------------------------------- */
    {
      id: 'irs_transcript_phone', type: 'phone', keywords: ['tax transcript phone', 'irs phone', 'call irs'],
      title: L('Order IRS tax transcripts by phone', 'Pida sus transcripciones de impuestos del IRS por teléfono'),
      summary: L('A free automated line. The IRS mails the transcript to the address on your last tax return in 5–10 days.', 'Una línea automática y gratuita. El IRS envía la transcripción por correo a la dirección de su última declaración en 5 a 10 días.'),
      phone: '+18009089946', phoneDisplay: '800-908-9946', verified: true,
      source: 'https://www.irs.gov/individuals/get-transcript',
      hours: L('Automated, 24 hours a day, 7 days a week', 'Automática, las 24 horas, los 7 días de la semana'),
      fields: ['taxYears'],
      haveReady: [
        L('Your Social Security number or ITIN', 'Su número de Seguro Social o ITIN'),
        L('Your mailing address exactly as it appears on your most recent tax return', 'Su dirección postal exactamente como aparece en su declaración de impuestos más reciente'),
        L('Which years you need: {{taxYears}}', 'Los años que necesita: {{taxYears}}')
      ],
      script: [
        L('Call 800-908-9946. This is a recording, not a person — just follow the prompts.', 'Llame al 800-908-9946. Es una grabación, no una persona — solo siga las instrucciones.'),
        L('Enter your Social Security number or ITIN when asked.', 'Marque su número de Seguro Social o ITIN cuando se lo pidan.'),
        L('Enter the numbers of your street address from your latest tax return.', 'Marque los números de su dirección según su última declaración de impuestos.'),
        L('Choose "tax return transcript" (unless your attorney asked for a different type).', 'Elija "tax return transcript" (a menos que su abogada le haya pedido otro tipo).'),
        L('Choose the year(s): {{taxYears}}. Repeat for each year.', 'Elija el año o años: {{taxYears}}. Repita para cada año.'),
        L('Write down today\'s date. The transcript arrives by mail in 5–10 calendar days.', 'Anote la fecha de hoy. La transcripción llega por correo en 5 a 10 días.')
      ],
      tips: [
        L('Moved since your last tax return? Don\'t call yet — tell your attorney. The IRS will mail it to the old address.', '¿Se mudó desde su última declaración? No llame todavía — avise a su abogada. El IRS lo enviaría a la dirección anterior.'),
        L('Transcripts are only available in English.', 'Las transcripciones solo están disponibles en inglés.')
      ]
    },
    {
      id: 'fbi_phone', type: 'phone', keywords: ['fbi phone', 'call fbi', 'fee waiver fbi'],
      title: L('Call the FBI about your background check request', 'Llame al FBI sobre su solicitud de antecedentes'),
      summary: L('For questions about your FBI Identity History Summary request (status, fee waiver, fingerprints).', 'Para preguntas sobre su solicitud del FBI "Identity History Summary" (estado, exención de pago, huellas).'),
      phone: '+13046255590', phoneDisplay: '304-625-5590', verified: true,
      source: 'https://www.fbi.gov/how-we-can-help-you/more-fbi-services-and-information/identity-history-summary-checks/identity-history-summary-checks-faqs',
      hours: L('Hours are not listed on the FBI website — try weekdays during business hours (Eastern Time). You can also email identity@fbi.gov.', 'El FBI no publica el horario — intente de lunes a viernes en horario de oficina (hora del Este). También puede escribir a identity@fbi.gov.'),
      fields: ['fullName', 'dob', 'address'],
      haveReady: [
        L('Your request or confirmation number (if you already applied)', 'Su número de solicitud o de confirmación (si ya la presentó)'),
        L('Your full name and date of birth', 'Su nombre completo y fecha de nacimiento'),
        L('Your mailing address', 'Su dirección postal'),
        L('Pen and paper', 'Papel y lápiz')
      ],
      script: [
        L('Call 304-625-5590 and follow the menu for Identity History Summary.', 'Llame al 304-625-5590 y siga el menú para "Identity History Summary".'),
        L('Say: "Hello, my name is {{fullName}}. I am calling about my Identity History Summary request."', 'Diga: "Hello, my name is {{fullName}}. I am calling about my Identity History Summary request." (Hola, me llamo {{fullName}}. Llamo por mi solicitud de Identity History Summary.)'),
        L('Explain what you need: the status of your request, or how to ask for a fee waiver.', 'Explique lo que necesita: el estado de su solicitud, o cómo pedir una exención del pago.'),
        L('If asked, give your date of birth ({{dob}}) and mailing address ({{address}}).', 'Si se lo piden, dé su fecha de nacimiento ({{dob}}) y su dirección ({{address}}).'),
        L('Before you hang up, write down the name of the person and what they told you.', 'Antes de colgar, anote el nombre de la persona y lo que le dijo.')
      ],
      tips: [L('You may ask for an interpreter. Speak slowly and it is OK to ask them to repeat.', 'Puede pedir un intérprete. Hable despacio; está bien pedir que repitan.')]
    },
    {
      id: 'uscis_contact', type: 'phone', keywords: ['uscis phone', 'call uscis', 'contact center', 'biometrics reschedule', 'notice not received'],
      title: L('Call the USCIS Contact Center (only if your attorney asks)', 'Llame al Centro de Contacto de USCIS (solo si su abogada se lo pide)'),
      summary: L('For example: to report a notice you never received or to reschedule an appointment.', 'Por ejemplo: para reportar un aviso que nunca recibió o para cambiar una cita.'),
      phone: '+18003755283', phoneDisplay: '800-375-5283', verified: true,
      source: 'https://www.uscis.gov/contactcenter',
      hours: L('Live agents Monday–Friday, 8 a.m.–8 p.m. Eastern. Automated help (English and Spanish) 24/7. TTY: 800-767-1833.', 'Agentes en vivo de lunes a viernes, 8 a. m. a 8 p. m. hora del Este. Ayuda automática (inglés y español) 24/7. TTY: 800-767-1833.'),
      fields: ['fullName', 'receiptNumber', 'aNumber', 'dob', 'address'],
      haveReady: [
        L('Your receipt notice (receipt number: {{receiptNumber}})', 'Su aviso de recibo (número de recibo: {{receiptNumber}})'),
        L('A copy of the application you are calling about', 'Una copia de la solicitud por la que llama'),
        L('Your A-Number, if you have one: {{aNumber}}', 'Su número A, si tiene: {{aNumber}}')
      ],
      script: [
        L('Call 800-375-5283. You can speak English or Spanish to the automated system.', 'Llame al 800-375-5283. Puede hablar en inglés o en español con el sistema automático.'),
        L('Say why you are calling in a few words (your attorney will tell you exactly what to say).', 'Diga en pocas palabras por qué llama (su abogada le dirá exactamente qué decir).'),
        L('When you reach an agent: "My name is {{fullName}}. I am calling about receipt number {{receiptNumber}}."', 'Cuando le atienda un agente: "Mi nombre es {{fullName}}. Llamo por el número de recibo {{receiptNumber}}."'),
        L('Answer the identity questions (date of birth {{dob}}, address {{address}}).', 'Responda las preguntas de identidad (fecha de nacimiento {{dob}}, dirección {{address}}).'),
        L('Write down the agent\'s name or ID and any reference number, then tell your attorney.', 'Anote el nombre o número del agente y cualquier número de referencia, y avise a su abogada.')
      ],
      tips: [L('Never pay anyone who calls you claiming to be USCIS.', 'Nunca pague a nadie que le llame diciendo ser de USCIS.')]
    },
    {
      id: 'vital_records_phone', type: 'phone', keywords: ['vital records phone', 'call vital records', 'registro civil teléfono'],
      title: L('Call the records office to order a certificate', 'Llame a la oficina de registros para pedir un acta'),
      summary: L('For a birth, marriage, or divorce record when the office prefers phone orders.', 'Para un acta de nacimiento, matrimonio o divorcio cuando la oficina prefiere pedidos por teléfono.'),
      phone: '', phoneDisplay: '', placeholder: true, verified: false,
      hours: L('Check the office\'s website (the CDC page lists each state\'s phone number).', 'Revise la página web de la oficina (la página de los CDC tiene el teléfono de cada estado).'),
      source: 'https://www.cdc.gov/nchs/w2w/index.htm',
      fields: ['fullName', 'recordType', 'dob', 'birthPlace', 'parentsNames', 'address', 'phone'],
      haveReady: [
        L('Full name on the record, date and place of the event', 'Nombre completo en el acta, fecha y lugar del evento'),
        L('Parents\' names, including mother\'s maiden name (for birth records)', 'Nombres de los padres, con el apellido de soltera de la madre (para actas de nacimiento)'),
        L('Your photo ID', 'Su identificación con foto'),
        L('A credit/debit card for the fee', 'Una tarjeta de crédito o débito para el pago')
      ],
      script: [
        L('Say: "Hello, I would like to order a certified copy of my {{recordType}}."', 'Diga: "Hello, I would like to order a certified copy of my {{recordType}}." (Hola, quisiera pedir una copia certificada de mi {{recordType}}.)'),
        L('Give the name on the record: {{fullName}}, date: {{dob}}, place: {{birthPlace}}.', 'Dé el nombre en el acta: {{fullName}}, fecha: {{dob}}, lugar: {{birthPlace}}.'),
        L('If asked for parents: {{parentsNames}}.', 'Si le preguntan por sus padres: {{parentsNames}}.'),
        L('Say it is for an immigration application, and ask for the "long form" or full copy.', 'Diga que es para una solicitud de inmigración y pida la copia "long form" o completa.'),
        L('Ask the fee and how long it takes. Give your mailing address: {{address}}.', 'Pregunte el costo y cuánto tarda. Dé su dirección postal: {{address}}.'),
        L('Write down the order or confirmation number.', 'Anote el número de pedido o confirmación.')
      ],
      tips: []
    },
    {
      id: 'consulate_phone', type: 'phone', keywords: ['consulate', 'consulado', 'embassy'],
      title: L('Call your consulate', 'Llame a su consulado'),
      summary: L('Ask your country\'s consulate how to get a document from your home country (birth certificate, police certificate, or passport).', 'Pregunte al consulado de su país cómo obtener un documento de su país (acta de nacimiento, carta de antecedentes penales o pasaporte).'),
      phone: '', phoneDisplay: '', placeholder: true, verified: false,
      hours: L('Check the consulate\'s website — many require an appointment.', 'Revise la página web del consulado — muchos requieren cita.'),
      fields: ['fullName', 'recordType', 'country', 'dob', 'birthPlace'],
      haveReady: [L('Your passport or national ID number', 'Su pasaporte o número de identificación nacional'), L('Pen and paper', 'Papel y lápiz')],
      script: [
        L('Say: "Buenos días, quisiera saber cómo obtener mi {{recordType}} de {{country}} desde Estados Unidos."', 'Diga: "Buenos días, quisiera saber cómo obtener mi {{recordType}} de {{country}} desde Estados Unidos."'),
        L('Give your name ({{fullName}}), date of birth ({{dob}}), and place of birth ({{birthPlace}}) if asked.', 'Dé su nombre ({{fullName}}), fecha de nacimiento ({{dob}}) y lugar de nacimiento ({{birthPlace}}) si se lo piden.'),
        L('Ask: Do I need an appointment? What is the fee? Can it be done online? How long does it take?', 'Pregunte: ¿Necesito cita? ¿Cuánto cuesta? ¿Se puede hacer en línea? ¿Cuánto tarda?'),
        L('Write down the answers and send them to your attorney.', 'Anote las respuestas y envíelas a su abogada.')
      ],
      tips: []
    },

    /* ---------------------------- ONLINE / MAIL ---------------------------- */
    {
      id: 'irs_transcript_online', type: 'online', keywords: ['tax transcript', 'tax transcripts', 'irs transcript', 'get transcript', 'transcripción de impuestos', 'impuestos'],
      title: L('Download your IRS tax transcripts', 'Descargue sus transcripciones de impuestos del IRS'),
      summary: L('Free official summaries of your tax returns. Online is fastest; by-mail and phone options exist too.', 'Resúmenes oficiales y gratuitos de sus declaraciones de impuestos. En línea es lo más rápido; también puede pedirlas por correo o teléfono.'),
      url: 'https://www.irs.gov/individuals/get-transcript', verified: true,
      fields: ['taxYears'],
      steps: [
        L('Open the IRS "Get Transcript" page (button below).', 'Abra la página "Get Transcript" del IRS (botón abajo).'),
        L('Choose "Get transcript online" and sign in or create an IRS account (you will need a photo ID to verify your identity).', 'Elija "Get transcript online" e inicie sesión o cree una cuenta del IRS (necesitará una identificación con foto).'),
        L('Can\'t verify online? Use "Get transcript by mail" instead, or call 800-908-9946.', '¿No puede verificar en línea? Use "Get transcript by mail" o llame al 800-908-9946.'),
        L('Download the "tax return transcript" for: {{taxYears}}.', 'Descargue el "tax return transcript" de: {{taxYears}}.'),
        L('Save the PDFs and send them to your attorney.', 'Guarde los PDF y envíelos a su abogada.')
      ],
      tips: [L('The IRS never asks for personal information by email or text. Only use irs.gov.', 'El IRS nunca pide información personal por correo electrónico o mensaje de texto. Use solo irs.gov.')]
    },
    {
      id: 'uscis_foia', type: 'online', keywords: ['foia', 'a-file', 'a file', 'immigration file', 'expediente migratorio'],
      title: L('Request your immigration file from USCIS (FOIA)', 'Solicite su expediente migratorio a USCIS (FOIA)'),
      summary: L('A free request for copies of your USCIS records. USCIS now asks that FOIA requests be made online.', 'Una solicitud gratuita de copias de sus registros en USCIS. USCIS ahora pide que las solicitudes FOIA se hagan en línea.'),
      url: 'https://first.uscis.gov/', verified: true,
      source: 'https://www.uscis.gov/records/request-records-through-the-freedom-of-information-act-or-privacy-act',
      fields: ['fullName', 'dob', 'birthPlace', 'aNumber', 'parentsNames', 'address'],
      steps: [
        L('Go to first.uscis.gov and sign in or create a USCIS online account.', 'Entre a first.uscis.gov e inicie sesión o cree una cuenta en línea de USCIS.'),
        L('Start a new request for your own records (your "A-File").', 'Inicie una nueva solicitud de sus propios registros (su "A-File").'),
        L('Enter your details exactly as on your documents: {{fullName}}, born {{dob}} in {{birthPlace}}, A-Number {{aNumber}}.', 'Escriba sus datos exactamente como en sus documentos: {{fullName}}, nacido/a el {{dob}} en {{birthPlace}}, número A {{aNumber}}.'),
        L('Parents\' names must match your records exactly: {{parentsNames}}.', 'Los nombres de sus padres deben coincidir exactamente con sus registros: {{parentsNames}}.'),
        L('Submit, then save or screenshot the confirmation (control) number and send it to your attorney.', 'Envíe la solicitud y guarde o tome captura del número de control; envíelo a su abogada.')
      ],
      tips: [L('Ask your attorney which records to request — specific requests are processed faster than a whole file.', 'Pregunte a su abogada qué registros pedir — las solicitudes específicas se procesan más rápido que el expediente completo.')]
    },
    {
      id: 'fbi_idhs', type: 'online', keywords: ['fbi', 'identity history', 'rap sheet', 'background check', 'antecedentes fbi', 'fingerprints'],
      title: L('Request your FBI background check (Identity History Summary)', 'Solicite su reporte de antecedentes del FBI (Identity History Summary)'),
      summary: L('Your FBI record (or proof you have none). Fee: $18. You will need fingerprints.', 'Su registro del FBI (o prueba de que no tiene). Costo: $18. Necesitará sus huellas.'),
      url: 'https://www.edo.cjis.gov/', verified: true,
      source: 'https://www.fbi.gov/how-we-can-help-you/more-fbi-services-and-information/identity-history-summary-checks/identity-history-summary-checks-faqs',
      fields: ['fullName', 'dob', 'address'],
      steps: [
        L('Go to edo.cjis.gov and start an Identity History Summary request for yourself.', 'Entre a edo.cjis.gov e inicie una solicitud de Identity History Summary para usted.'),
        L('Fill in your information and pay the $18 fee by credit card.', 'Llene sus datos y pague $18 con tarjeta de crédito.'),
        L('Choose how to give fingerprints: at a participating U.S. Post Office (extra fee may apply) or by mailing a fingerprint card.', 'Elija cómo dar sus huellas: en una oficina de correos participante (puede haber un cargo extra) o enviando una tarjeta de huellas por correo.'),
        L('Choose to get results electronically if offered — it is usually faster.', 'Elija recibir el resultado de forma electrónica si se lo ofrecen — suele ser más rápido.'),
        L('Send the results to your attorney as soon as they arrive. Can\'t afford the fee? Ask about a waiver at 304-625-5590 or identity@fbi.gov before applying.', 'Envíe el resultado a su abogada en cuanto llegue. ¿No puede pagar? Pregunte por una exención al 304-625-5590 o identity@fbi.gov antes de presentar la solicitud.')
      ],
      tips: [L('Do not mail cash or personal checks to the FBI.', 'No envíe efectivo ni cheques personales al FBI.')]
    },
    {
      id: 'police_certificate', type: 'online', keywords: ['police clearance', 'police certificate', 'antecedentes penales', 'carta de no antecedentes'],
      title: L('Get a police certificate from your home country', 'Obtenga una carta de antecedentes penales de su país'),
      summary: L('A certificate from the police of countries where you lived, as your attorney instructs.', 'Un certificado de la policía de los países donde vivió, según le indique su abogada.'),
      url: 'https://travel.state.gov/content/travel/en/us-visas/Visa-Reciprocity-and-Civil-Documents-by-Country.html', verified: true,
      fields: ['country'],
      steps: [
        L('Open the U.S. State Department page (button below) and choose {{country}}.', 'Abra la página del Departamento de Estado (botón abajo) y elija {{country}}.'),
        L('Click "Police, Court, Prison Records" to see the name of the document, who issues it, and how to apply.', 'Haga clic en "Police, Court, Prison Records" para ver el nombre del documento, quién lo emite y cómo solicitarlo.'),
        L('Follow that procedure — many countries allow online requests or requests through the consulate.', 'Siga ese procedimiento — muchos países permiten pedirlo en línea o en el consulado.'),
        L('Send your attorney a copy when you have it.', 'Envíe una copia a su abogada cuando lo tenga.')
      ],
      tips: [L('U.S. police certificates are generally NOT needed for this — ask your attorney if unsure.', 'Por lo general NO se necesitan cartas de la policía de EE. UU. para esto — pregunte a su abogada si tiene dudas.')]
    },
    {
      id: 'vital_records_online', type: 'online', keywords: ['vital records', 'order certificate', 'registros vitales'],
      title: L('Order a U.S. birth, marriage, or divorce record', 'Pida un acta de nacimiento, matrimonio o divorcio de EE. UU.'),
      summary: L('Use the CDC directory to find the right state office, then order online or by mail.', 'Use el directorio de los CDC para encontrar la oficina estatal correcta y pida el acta en línea o por correo.'),
      url: 'https://www.cdc.gov/nchs/w2w/index.htm', verified: true,
      fields: ['recordType'],
      steps: [
        L('Open the CDC "Where to Write for Vital Records" page and click the state where the event happened.', 'Abra la página de los CDC "Where to Write for Vital Records" y haga clic en el estado donde ocurrió el evento.'),
        L('Find the section for your {{recordType}}: it lists the office, fee, and website.', 'Busque la sección de su {{recordType}}: indica la oficina, el costo y la página web.'),
        L('Order a certified copy online or by mail, following that office\'s instructions.', 'Pida una copia certificada en línea o por correo siguiendo las instrucciones de esa oficina.'),
        L('Keep the receipt and send the certificate to your attorney when it arrives.', 'Guarde el recibo y envíe el acta a su abogada cuando llegue.')
      ],
      tips: [L('Fees change — confirm on the state\'s own website before paying.', 'Los costos cambian — confírmelos en la página del estado antes de pagar.')]
    }
  ];

  var CASE_TYPES = {
    family_gc: { label: 'Family-based green card (spouse of U.S. citizen)', labelEs: 'Residencia por familia (cónyuge de ciudadano)',
      suggested: ['birth_cert', 'passport_copy', 'marriage_cert', 'prior_marriage_end', 'joint_financial', 'relationship_photos', 'affidavit_request', 'irs_transcript_online', 'employment_letter', 'immigration_docs', 'passport_photos', 'police_certificate'] },
    naturalization: { label: 'Naturalization (N-400)', labelEs: 'Naturalización (N-400)',
      suggested: ['passport_copy', 'immigration_docs', 'irs_transcript_phone', 'court_records', 'fbi_idhs', 'marriage_cert', 'employment_letter', 'passport_photos'] },
    asylum: { label: 'Asylum', labelEs: 'Asilo',
      suggested: ['passport_copy', 'birth_cert', 'immigration_docs', 'uscis_foia', 'consulate_phone', 'passport_photos', 'school_letter'] },
    daca: { label: 'DACA renewal', labelEs: 'Renovación de DACA',
      suggested: ['immigration_docs', 'daca_residence', 'school_letter', 'court_records', 'passport_photos'] },
    other: { label: 'Other / custom', labelEs: 'Otro', suggested: [] }
  };

  var byId = {};
  ITEMS.forEach(function (it) { byId[it.id] = it; });

  global.CC_LIBRARY = { VERIFIED_ON: VERIFIED_ON, FIELD_DEFS: FIELD_DEFS, TYPES: TYPES, ITEMS: ITEMS, CASE_TYPES: CASE_TYPES, byId: byId };
})(window);
