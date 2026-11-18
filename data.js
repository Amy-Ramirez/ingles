/* Contenido personal de la app de inglés de Amy.
   Todo sale de su diagnóstico del 18-nov-2026. Para actualizarlo, edita aquí. */

// ---------- DIAGNÓSTICO Y NIVELES ----------
// Escala numérica para la gráfica: 2=A2 · 2.5=A2+ · 3=B1 · 3.5=B1+ · 4=B2 · 4.5=B2+ · 5=C1 · 5.5=C1+ · 6=C2
const LEVELS = { 2: 'A2', 2.5: 'A2+', 3: 'B1', 3.5: 'B1+', 4: 'B2', 4.5: 'B2+', 5: 'C1', 5.5: 'C1+', 6: 'C2' };
const SKILLS = [
  { id: 'listening', n: 'Listening', c: '#c2410c' },
  { id: 'grammar', n: 'Gramática', c: '#2563eb' },
  { id: 'vocab', n: 'Vocabulario', c: '#7c3aed' },
  { id: 'reading', n: 'Lectura', c: '#0f766e' },
  { id: 'writing', n: 'Writing', c: '#be185d' },
  { id: 'speaking', n: 'Speaking', c: '#a16207' }
];
const START = '2026-11-18'; // día 1 del plan
const DIAGNOSIS = {
  date: '2026-11-18', label: 'Diagnóstico',
  skills: { grammar: 3, vocab: 3.5, reading: 3.5, listening: 2.5, writing: 3, speaking: null },
  notes: {
    grammar: '7/15. Dominas condicionales 2.º y 3.º, pasado perfecto y pasiva. Fallas en calcos del español y en -ing tras preposición.',
    vocab: '5/9. Falsos amigos bien. Faltan phrasal verbs y colocaciones de trabajo (fill in, expand on).',
    reading: '5,5/8. Captas la idea y deduces bien; pierdes precisión (marked down, by no means).',
    listening: 'Charla TED británica: entiendes el primer minuto y luego se pierde. Tu punto más débil y el que más rápido va a subir.',
    writing: 'Email claro y bien organizado, con calcos (contact with me, thank you in advice, experience on).',
    speaking: 'Pendiente: grábate con las dos preguntas del día 1.'
  }
};

// ---------- TUS ERRORES (el plan diario sale de aquí) ----------
// Cada ítem: fix = frase mal → la escribes bien (a = respuestas válidas) · mc = elegir opción (c = índice correcto)
const ERRORS = [
  { id: 'calco', t: 'Calcos del español', w: 3,
    rule: 'Hay verbos que en inglés no llevan la preposición o la estructura del español. Apréndelos como bloques: <b>I agree</b> · <b>depends on</b> · <b>contact me</b> · <b>thank you in advance</b> · <b>experience with/in</b> · <b>explain sth to sb</b> · <b>tell me</b> · <b>discuss sth</b> · <b>want you to…</b>',
    speak: ['Tell me about a time you disagreed with someone at work. Use "I agree / I don\'t agree".', 'Explain to a friend what your job is. Use "explain + thing + to + person".'],
    items: [
      { fix: 'I am agree with you.', a: ['I agree with you.'] },
      { fix: 'It depends of the situation.', a: ['It depends on the situation.'] },
      { fix: 'Please contact with me if you have any questions.', a: ['Please contact me if you have any questions.'] },
      { fix: 'Thank you in advice.', a: ['Thank you in advance.'] },
      { fix: 'I have experience on SQL and Python.', a: ['I have experience with SQL and Python.', 'I have experience in SQL and Python.'] },
      { fix: 'She explained me the problem.', a: ['She explained the problem to me.'] },
      { fix: 'Can you say me the price?', a: ['Can you tell me the price?'] },
      { fix: 'We discussed about the budget.', a: ['We discussed the budget.'] },
      { fix: 'I want that you check the numbers.', a: ['I want you to check the numbers.'] },
      { fix: 'I have 26 years.', a: ["I'm 26.", 'I am 26.', "I'm 26 years old.", 'I am 26 years old.'] }
    ] },
  { id: 'since', t: 'Desde hace… (since / for)', w: 3,
    rule: 'Si algo empezó en el pasado y <b>sigue ahora</b>, el inglés usa present perfect, no presente: <b>I have lived</b> in Madrid since 2019 / <b>I\'ve been working</b> here for two years. Si está terminado y dices cuándo (yesterday, in 2022), pasado simple: <b>I sent</b> it yesterday.',
    speak: ['How long have you lived in Madrid? How long have you studied English? How long have you been in your current job?', 'Talk about three things you have done this year (no dates!) and three things you did last year (with dates).'],
    items: [
      { fix: 'I live in Madrid since 2019.', a: ['I have lived in Madrid since 2019.', "I've lived in Madrid since 2019.", 'I have been living in Madrid since 2019.', "I've been living in Madrid since 2019."] },
      { fix: 'I work here for two years.', a: ['I have worked here for two years.', "I've worked here for two years.", 'I have been working here for two years.', "I've been working here for two years."], h: '(y sigues trabajando aquí)' },
      { fix: 'How long do you work in marketplace?', a: ['How long have you worked in marketplace?', 'How long have you been working in marketplace?'] },
      { fix: 'I have finished my master in 2022.', a: ["I finished my Master's in 2022.", "I finished my master's in 2022.", "I finished my master's degree in 2022.", "I finished my Master's degree in 2022."] },
      { fix: 'Yesterday I have sent the report to my boss.', a: ['Yesterday I sent the report to my boss.', 'I sent the report to my boss yesterday.'] },
      { mc: 'I ___ her since university.', o: ['know', 'knew', 'have known'], c: 2 },
      { mc: "I've been studying English ___ March.", o: ['for', 'since', 'during'], c: 1 },
      { mc: 'I ___ to London three times.', o: ['went', 'have been', 'am been'], c: 1 },
      { mc: 'We ___ the new dashboard last week.', o: ['launched', 'have launched', 'have been launching'], c: 0 }
    ] },
  { id: 'ing', t: 'Preposición + -ing', w: 3,
    rule: 'Después de una preposición (to en <i>looking forward to</i>, <i>used to</i>; in, at, about, for, before, after, without…) el verbo va en <b>-ing</b>: looking forward to <b>meeting</b> you · I\'m used to <b>waking up</b> early · interested in <b>working</b> in fashion · good at <b>analysing</b> data.',
    speak: ['What are you looking forward to doing this year? What are you used to doing every morning?', 'What are you good at? What are you interested in doing in five years? (good at -ing, interested in -ing)'],
    items: [
      { fix: "I'm looking forward to meet you.", a: ["I'm looking forward to meeting you.", 'I am looking forward to meeting you.'] },
      { fix: "I'm used to wake up early.", a: ["I'm used to waking up early.", 'I am used to waking up early.'] },
      { fix: "I'm interested in work in fashion.", a: ["I'm interested in working in fashion.", 'I am interested in working in fashion.'] },
      { fix: 'Before to start, let me introduce myself.', a: ['Before starting, let me introduce myself.', 'Before I start, let me introduce myself.'] },
      { fix: "I'm good at analyse data.", a: ["I'm good at analysing data.", "I'm good at analyzing data.", 'I am good at analysing data.', 'I am good at analyzing data.'] },
      { fix: "I'm not used to speak English at work.", a: ["I'm not used to speaking English at work.", 'I am not used to speaking English at work.'] },
      { mc: 'Thank you for ___ the time to meet me.', o: ['take', 'taking', 'to take'], c: 1 },
      { mc: "I'm thinking about ___ to London.", o: ['move', 'moving', 'to move'], c: 1 },
      { mc: 'I left without ___ goodbye.', o: ['say', 'to say', 'saying'], c: 2 }
    ] },
  { id: 'agree', t: 'Concordancia: people, information, there are', w: 2,
    rule: '<b>People</b> es plural (people <b>are</b>). <b>Information, advice, experience</b> (= experiencia profesional), <b>news</b> son incontables: nada de <i>an advice</i> ni <i>informations</i>. <b>There were</b> + plural.',
    speak: ['Describe the people in your city and the people at your work. (People are…, people tend to…)', 'Give me some advice about living in Madrid. (some advice, a piece of advice)'],
    items: [
      { fix: 'People is very friendly in London.', a: ['People are very friendly in London.'] },
      { fix: 'There was a lot of people at the meeting.', a: ['There were a lot of people at the meeting.'] },
      { fix: 'The information are on the website.', a: ['The information is on the website.'] },
      { fix: 'Can you give me an advice?', a: ['Can you give me some advice?', 'Can you give me a piece of advice?', 'Can you give me advice?'] },
      { fix: 'I have a lot of experiences in Excel.', a: ['I have a lot of experience in Excel.', 'I have a lot of experience with Excel.'] },
      { fix: 'Everybody know the answer.', a: ['Everybody knows the answer.'] },
      { mc: 'There ___ three candidates for the role.', o: ['is', 'are', 'has'], c: 1 },
      { mc: 'The news ___ good today.', o: ['is', 'are'], c: 0 }
    ] },
  { id: 'unreal', t: 'Pasado "irreal": wish, it\'s time, if', w: 2,
    rule: 'Tras <b>I wish / it\'s (high) time / I\'d rather / if</b> imaginario, el verbo "retrocede": presente → <b>pasado</b> (I wish I <b>had</b> more time · it\'s time we <b>made</b> a decision) y pasado → <b>pasado perfecto</b> (I wish I <b>hadn\'t said</b> that). Nunca <i>if I would</i>.',
    speak: ['Tell me three things you wish were different in your life right now (I wish I had / I wish I could / I wish I was…).', 'If you lived in London, what would you do on a typical Saturday? If you had studied fashion, what would you have done?'],
    items: [
      { mc: 'I wish I ___ more time.', o: ['have', 'had', 'would have'], c: 1 },
      { mc: 'I wish I ___ that to my manager yesterday.', o: ["didn't say", "hadn't said", "wouldn't say"], c: 1 },
      { mc: "It's time we ___ a decision.", o: ['make', 'made', 'will make'], c: 1 },
      { mc: "I'd rather you ___ me first next time.", o: ['call', 'called', 'will call'], c: 1 },
      { mc: "If I ___ you, I'd accept the offer.", o: ['am', 'were', 'would be'], c: 1 },
      { fix: 'If I would have more time, I would study more.', a: ['If I had more time, I would study more.', "If I had more time, I'd study more."] },
      { fix: 'If I would have known, I would have applied.', a: ['If I had known, I would have applied.', "If I'd known, I'd have applied.", "If I had known, I'd have applied."] }
    ] },
  { id: 'future', t: 'Futuro y tiempos perfectos', w: 2,
    rule: '<b>By (the time)…</b> → will <b>have</b> + participio (the meeting will have finished). Después de <b>when / as soon as / before</b> hablando de futuro va <b>presente</b>, no will: I\'ll call you when I <b>arrive</b>. Planes ya organizados: <b>I\'m meeting</b> my manager tomorrow.',
    speak: ['Where will you be and what will you have achieved by this time next year?', 'Tell me your plans for this weekend (I\'m meeting… / I\'m going to…).'],
    items: [
      { mc: 'By the time we arrive, the meeting ___.', o: ['will finish', 'will have finished', 'finishes'], c: 1 },
      { mc: 'By December I ___ here for a year.', o: ['will work', 'will have worked', 'work'], c: 1 },
      { fix: 'I will call you when I will arrive.', a: ['I will call you when I arrive.', "I'll call you when I arrive."] },
      { mc: "I'll send it as soon as I ___ the numbers.", o: ['get', 'will get', 'got'], c: 0 },
      { mc: 'This time tomorrow I ___ my interview.', o: ['will do', 'will be doing', 'do'], c: 1 },
      { mc: "I ___ my manager tomorrow at 10 — it's in the calendar.", o: ['meet', 'am meeting', 'will have met'], c: 1 }
    ] },
  { id: 'contrast', t: 'Contraste: despite, although, however', w: 2,
    rule: '<b>Despite / In spite of</b> + nombre o -ing (despite <b>the delay</b>, despite <b>being</b> tired). <b>Although / Even though</b> + frase completa (although <b>it was raining</b>). <b>However,</b> empieza frase nueva. Nunca <i>despite of</i>.',
    speak: ['Talk about a job you liked despite its problems. Use despite, although and however once each.'],
    items: [
      { mc: '___ her lack of experience, she got the job.', o: ['Although', 'Despite', 'However'], c: 1 },
      { mc: '___ it was raining, we went out.', o: ['Despite', 'Although', 'In spite of'], c: 1 },
      { mc: 'The salary is low. ___, the team is great.', o: ['However', 'Although', 'Despite'], c: 0 },
      { fix: 'Despite of the price, I bought it.', a: ['Despite the price, I bought it.', 'In spite of the price, I bought it.'] },
      { fix: 'Although the delay, we finished on time.', a: ['Despite the delay, we finished on time.', 'In spite of the delay, we finished on time.'] },
      { mc: 'Despite ___ tired, she finished the analysis.', o: ['be', 'being', 'she was'], c: 1 }
    ] },
  { id: 'order', t: 'Orden de la frase', w: 2,
    rule: 'Dentro de otra pregunta no se invierte: Do you know where <b>the office is</b>? · I don\'t know what <b>he wants</b>. Objeto pegado al verbo: I like <b>fashion</b> very much · explain <b>the problem</b> to me. Adverbios de frecuencia: <b>I\'m always</b> late / <b>I always arrive</b> late.',
    speak: ['Ask me five polite questions starting with "Do you know…", "Could you tell me…", "I was wondering…".'],
    items: [
      { fix: 'Do you know where is the office?', a: ['Do you know where the office is?'] },
      { fix: 'Can you tell me what time is it?', a: ['Can you tell me what time it is?'] },
      { fix: 'I like very much fashion.', a: ['I like fashion very much.', 'I really like fashion.', 'I like fashion a lot.'] },
      { fix: 'I always am on time.', a: ['I am always on time.', "I'm always on time."] },
      { fix: 'She explained to me the problem.', a: ['She explained the problem to me.'] },
      { fix: "I don't know what does he want.", a: ["I don't know what he wants."] },
      { fix: 'Could you tell me how much does it cost?', a: ['Could you tell me how much it costs?'] }
    ] },
  { id: 'articles', t: 'Artículos (the / a / nada)', w: 1,
    rule: 'Hablando <b>en general</b>, sin artículo: <b>Fashion</b> is my passion · <b>Life</b> in London is expensive · I work in <b>marketing</b>. Profesiones con <b>a/an</b>: I\'m <b>an</b> economist. Algo concreto que los dos conocemos: <b>the</b> situation.',
    speak: ['Talk about what you love and hate in general: fashion, data, cities, people, money (sin "the"!).'],
    items: [
      { fix: 'It depends on situation.', a: ['It depends on the situation.'] },
      { fix: 'I have a master in Big Data.', a: ["I have a Master's in Big Data.", "I have a master's in Big Data.", "I have a master's degree in Big Data.", "I have a Master's degree in Big Data."] },
      { fix: 'The fashion is my passion.', a: ['Fashion is my passion.'] },
      { fix: "I'm economist.", a: ["I'm an economist.", 'I am an economist.'] },
      { fix: 'The life in London is expensive.', a: ['Life in London is expensive.'] },
      { fix: 'I usually go to the work by metro.', a: ['I usually go to work by metro.', 'I usually go to work by tube.', 'I usually go to work by underground.'] },
      { mc: "She's ___ honest person.", o: ['a', 'an', 'the'], c: 1 }
    ] },
  { id: 'phrasal', t: 'Phrasal verbs y frases de trabajo', w: 3,
    rule: 'Son lo que hace que suenes profesional y natural. Apréndelos con su frase: <b>fill me in</b> (ponme al día) · <b>expand on</b> (desarrollar) · <b>put off</b> (aplazar) · <b>follow up</b> (hacer seguimiento) · <b>reach out</b> (contactar) · <b>catch up</b> (ponerse al día) · <b>run out of</b> (quedarse sin) · <b>make a mistake</b>.',
    speak: ['Describe your last week at work using five of these: fill in, follow up, catch up, put off, reach out, run out of, come up with.'],
    items: [
      { mc: 'Can you ___ me in on the meeting?', o: ['fill', 'catch', 'bring'], c: 0 },
      { mc: 'Could you ___ on that point?', o: ['enlarge', 'expand', 'extend'], c: 1 },
      { mc: "Let's ___ the meeting until Friday.", o: ['put off', 'put on', 'put up'], c: 0 },
      { mc: "I'll ___ up with an email tomorrow.", o: ['follow', 'come', 'go'], c: 0 },
      { mc: "I'd like to ___ out to you about the role.", o: ['reach', 'arrive', 'get'], c: 0 },
      { mc: 'Sales ___ by 12% last quarter.', o: ['raised', 'rose', 'arose'], c: 1 },
      { mc: 'We ran out ___ stock in two days.', o: ['from', 'of', 'with'], c: 1 },
      { mc: 'I ___ a mistake in the forecast.', o: ['did', 'made', 'had'], c: 1 },
      { mc: 'Can we ___ up next week? I want to hear your news.', o: ['catch', 'fill', 'chase'], c: 0 },
      { mc: 'We need to ___ up with a better plan.', o: ['come', 'make', 'bring'], c: 0 },
      { mc: 'He tends to ___ the question whenever I ask about pay.', o: ['sidetrack', 'sidestep', 'sideline'], c: 1 }
    ] }
];

// ---------- TU VOCABULARIO (repetición espaciada) ----------
// t: diag = salió en tu diagnóstico · buy = buying & merchandising · data = datos/marketplace · job = entrevistas y trabajo
const VOCAB = [
  // De tu diagnóstico
  ['marked down', 'rebajado de precio', 'Slow sellers get marked down at the end of the season.', 'diag'],
  ['by no means', 'en absoluto, para nada', 'Retail experience is by no means essential.', 'diag'],
  ['shortlisted', 'preseleccionado/a', 'Only shortlisted candidates will be contacted.', 'diag'],
  ['to chase stock', 'pedir más de lo que se vende bien', 'The dress sold out in a week, so we chased stock.', 'diag'],
  ['slow-moving lines', 'productos que se venden despacio', 'Flag slow-moving lines before they need a markdown.', 'diag'],
  ['commercially minded', 'con visión de negocio', 'We need someone analytical and commercially minded.', 'diag'],
  ['to back up (an opinion)', 'respaldar, justificar', 'Back up your opinions with numbers.', 'diag'],
  ['the right to work', 'el permiso para trabajar', 'Candidates must have the right to work in the UK.', 'diag'],
  ['to fill (someone) in', 'poner al día a alguien', 'Can you fill me in on the latest numbers?', 'diag'],
  ['to expand on', 'desarrollar (una idea)', "I'd like to expand on what I said earlier.", 'diag'],
  ['compelling', 'convincente, muy atractivo', 'She made a compelling case for the new range.', 'diag'],
  ['to sidestep', 'esquivar (un tema)', 'He sidestepped the question about salary.', 'diag'],
  ['to mitigate', 'mitigar, reducir (un riesgo)', 'We need to mitigate the risks before we sign.', 'diag'],
  ['in advance', 'por adelantado', 'Thank you in advance for your time.', 'diag'],
  ['crude oil', 'petróleo crudo', 'Polyester is made from crude oil.', 'diag'],
  ['landfill', 'vertedero', 'Most of those clothes end up in landfill.', 'diag'],
  ['to mend', 'arreglar, remendar', 'Our grandmothers used to mend their clothes.', 'diag'],
  ['off grid', 'sin conexión a la red eléctrica', 'She grew up off grid in the north of England.', 'diag'],
  ['hand-me-downs', 'ropa heredada', 'I wore my sister\'s hand-me-downs as a kid.', 'diag'],
  ['to relocate', 'trasladarse (por trabajo)', "I'm happy to relocate to London.", 'diag'],
  // Buying & merchandising
  ['sell-through (rate)', '% de unidades vendidas sobre las recibidas', 'Full-price sell-through was 68% this season.', 'buy'],
  ['range planning', 'planificación de la colección', 'Range planning starts nine months before launch.', 'buy'],
  ['open-to-buy (OTB)', 'presupuesto de compra disponible', "We've got very little open-to-buy left for spring.", 'buy'],
  ['weeks of cover', 'semanas de stock según ritmo de venta', "We've only got two weeks of cover on denim.", 'buy'],
  ['markdown', 'rebaja', 'Markdowns are eating into our margin.', 'buy'],
  ['margin', 'margen', 'The intake margin on this line is 65%.', 'buy'],
  ['best-seller / bestseller', 'superventas', 'Flag best-sellers early so we can reorder.', 'buy'],
  ['to reorder / repeat', 'reponer, volver a pedir', 'We repeated the trench coat twice.', 'buy'],
  ['allocation', 'reparto de stock por tiendas/canales', 'Allocation sends more stock to the busiest stores.', 'buy'],
  ['lead time', 'plazo de entrega del proveedor', 'The lead time from that supplier is twelve weeks.', 'buy'],
  ['supplier', 'proveedor', 'We negotiated better prices with our supplier.', 'buy'],
  ['catwalk / runway', 'pasarela (UK / US)', 'Buyers watch the catwalks for trends.', 'buy'],
  ['womenswear / menswear', 'moda mujer / hombre', "I'd love to work in womenswear.", 'buy'],
  ['footfall', 'afluencia de clientes a tienda', 'Footfall dropped 8% in January.', 'buy'],
  ['to sell out', 'agotarse', 'The bag sold out in three days.', 'buy'],
  ['dead stock', 'stock que no se vende', 'We need to clear the dead stock.', 'buy'],
  // Data / marketplace
  ['to drive (growth)', 'impulsar (crecimiento)', 'Promotions drove a 15% uplift in orders.', 'data'],
  ['uplift', 'aumento (atribuible a algo)', 'The test showed a 4% uplift in conversion.', 'data'],
  ['conversion rate', 'tasa de conversión', 'Conversion rate went up after the redesign.', 'data'],
  ['churn', 'pérdida de clientes/usuarios', 'Churn is highest in the first month.', 'data'],
  ['retention', 'retención', 'We improved driver retention by 10%.', 'data'],
  ['supply and demand', 'oferta y demanda', 'My job is balancing supply and demand in real time.', 'data'],
  ['forecast', 'previsión', 'Our demand forecast was 5% off.', 'data'],
  ['insight', 'conclusión útil, hallazgo', 'The key insight was that weekends behave differently.', 'data'],
  ['stakeholder', 'parte interesada', 'I present the results to senior stakeholders.', 'data'],
  ['deep dive', 'análisis a fondo', "Let's do a deep dive into last month's drop.", 'data'],
  ['to roll out', 'lanzar, desplegar', 'We rolled out the feature to all cities.', 'data'],
  ['A/B test', 'test A/B', 'We ran an A/B test on the new pricing.', 'data'],
  ['to flag', 'señalar, avisar de', 'The dashboard flags unusual drops automatically.', 'data'],
  ['to be off (by)', 'desviarse, fallar (por)', 'The forecast was off by 3%.', 'data'],
  // Entrevistas y trabajo
  ['to look forward to + -ing', 'tener ganas de', "I'm looking forward to hearing from you.", 'job'],
  ['to reach out', 'contactar', 'I wanted to reach out about the analyst role.', 'job'],
  ['to follow up', 'hacer seguimiento', "I'm following up on my application.", 'job'],
  ['strengths and weaknesses', 'puntos fuertes y débiles', 'One of my strengths is turning data into decisions.', 'job'],
  ['to hold myself accountable', 'responsabilizarme', 'I hold myself accountable for my numbers.', 'job'],
  ['to take ownership of', 'hacerse cargo de', 'I took ownership of the weekly report.', 'job'],
  ['a fast-paced environment', 'un entorno de ritmo rápido', 'I thrive in a fast-paced environment.', 'job'],
  ['to thrive', 'prosperar, rendir al máximo', 'I thrive under pressure.', 'job'],
  ['a steep learning curve', 'una curva de aprendizaje empinada', 'The first months were a steep learning curve.', 'job'],
  ['to bring to the table', 'aportar', 'I bring both data skills and a love of fashion to the table.', 'job'],
  ['notice period', 'preaviso', 'My notice period is one month.', 'job'],
  ['salary expectations', 'expectativas salariales', 'My salary expectations are in line with the market.', 'job'],
  ['to be keen on / keen to', 'tener muchas ganas de', "I'm really keen to learn about buying.", 'job'],
  ['challenging situations', 'situaciones difíciles', 'I stay calm in challenging situations.', 'job'],
  ['to put into practice', 'poner en práctica', 'I want to put my skills into practice.', 'job']
].map(([en, es, ex, t], i) => ({ id: 'v' + i, en, es, ex, t }));

// ---------- SHADOWING ----------
const SHADOW = [
  { g: 'Entrevista', p: [
    "Thanks so much for having me. I'm really excited about this role.",
    "I studied economics and international relations, and then did a master's in big data.",
    "What I enjoy most is turning messy data into clear decisions.",
    "That's a great question. Let me think about it for a second.",
    "In my current role, I work on balancing supply and demand in real time.",
    "I'd say my biggest strength is that I combine analytical skills with commercial sense.",
    "I've always been passionate about fashion, and I'd love to bring my data skills to a buying team.",
    "Could you tell me a bit more about what success looks like in the first six months?",
    "I'm looking forward to hearing from you.",
    "Sorry, could you repeat the question? I want to make sure I understood it correctly."
  ] },
  { g: 'Reuniones', p: [
    "Could you fill me in on what I missed?",
    "Just to make sure I understand: you're saying that sales dropped because of the weather?",
    "I see your point, but I'm not sure the data backs that up.",
    "Let's put this off until we have the final numbers.",
    "I'll follow up with an email after the meeting.",
    "Can I just jump in here for a second?",
    "I'd like to expand on what Sarah said earlier.",
    "That's a fair point. Let me look into it and get back to you."
  ] },
  { g: 'Moda y datos', p: [
    "The trench coat sold out in three days, so we chased stock straight away.",
    "Full-price sell-through was much higher than we expected.",
    "We need to flag slow-moving lines before they get marked down.",
    "Our forecast was off by five percent because of the heatwave.",
    "The data shows that customers buy more on Sunday evenings.",
    "We bought three times as many clothes as we did in 1980, and wore them for half as long."
  ] },
  { g: 'Día a día', p: [
    "I've lived in Madrid since I was a kid, but I'd love to live in London for a few years.",
    "I'm used to waking up early, but I'm not a morning person at all.",
    "To be honest, I'd rather stay in tonight.",
    "I wish I had more time to read.",
    "It depends on the situation, to be fair.",
    "I agree with you, but I see it a bit differently.",
    "Do you know where the nearest tube station is?",
    "I can't believe it's already Friday!"
  ] }
];

// ---------- PREPARACIÓN DE ENTREVISTAS ----------
// tr: all = siempre · data = analista de datos/marketplace · buy = buying & merchandising
const INTERVIEW = [
  { tr: 'all', q: 'Tell me about yourself.', tip: 'Fórmula presente → pasado → futuro, en 60–90 s. Termina con por qué este puesto.',
    ph: ["I'm currently working as… at…, where I…", 'Before that, I studied… and did a master\'s in…', "What I enjoy most is…", "That's why I'm really excited about this role, because…"] },
  { tr: 'all', q: 'Why do you want to work here?', tip: 'Dos razones concretas de la empresa + una de ti. Demuestra que has investigado.',
    ph: ["I've followed your brand for a long time, and…", 'What really stands out to me is…', 'I think my background in… would fit really well with…'] },
  { tr: 'all', q: 'Why do you want to move to London?', tip: 'Positivo y profesional: el mercado, la industria, crecer. No hables mal de Madrid.',
    ph: ['London is one of the most exciting places to work in fashion retail.', "I'm keen to work in an international environment.", "I've wanted to do this for a long time, and now feels like the right moment."] },
  { tr: 'all', q: 'What are your strengths?', tip: 'Dos fortalezas con un ejemplo real cada una. Mejor una que una lista.',
    ph: ['One of my main strengths is…', 'For example, last year I…', 'As a result,…'] },
  { tr: 'all', q: 'What is your biggest weakness?', tip: 'Una debilidad real pero no crítica + qué haces para mejorarla. ¡Tu inglés puede ser la respuesta!',
    ph: ['Something I\'m working on is…', 'To improve it, I\'ve started…', "I've already noticed that…"] },
  { tr: 'all', q: 'Tell me about a time you worked under pressure.', tip: 'Método STAR: Situation, Task, Action, Result. Pasado simple. Cierra con un número.',
    ph: ['The situation was…', 'My task was to…', 'What I did was…', 'In the end, we… which meant…'] },
  { tr: 'all', q: 'Tell me about a time you disagreed with a colleague or manager.', tip: 'STAR. Muestra que escuchas, usas datos y llegáis a un acuerdo.',
    ph: ['We had different views on…', 'I listened to their point, and then I showed them the data…', 'In the end we agreed to…'] },
  { tr: 'all', q: 'Tell me about a mistake you made.', tip: 'Un error real, cómo lo arreglaste y qué aprendiste. Sin dramatizar.',
    ph: ['I made a mistake in…', 'As soon as I realised, I…', 'Since then, I always…'] },
  { tr: 'all', q: 'Where do you see yourself in five years?', tip: 'Ambiciosa pero ligada al puesto: crecer dentro de la empresa.',
    ph: ["In five years, I'd like to have…", "I'd love to grow into a… role.", 'Ideally, I would be…'] },
  { tr: 'all', q: 'What are your salary expectations?', tip: 'Da un rango investigado y muestra flexibilidad.',
    ph: ['Based on my research, I was thinking of something in the range of…', "But I'm open to discussing the whole package."] },
  { tr: 'all', q: 'Do you have any questions for us?', tip: 'SIEMPRE di que sí. Ten 3 preparadas.',
    ph: ['What does success look like in the first six months?', 'How is the team structured?', 'What do you enjoy most about working here?'] },
  { tr: 'data', q: 'Walk me through a data project you are proud of.', tip: 'Problema de negocio → datos → análisis → decisión → impacto en número.',
    ph: ['The business problem was…', 'I pulled data from… and…', 'The key insight was…', 'This led to a…% improvement in…'] },
  { tr: 'data', q: 'How would you explain a complex analysis to a non-technical stakeholder?', tip: 'Empieza por la conclusión, una cifra clave, un gráfico simple.',
    ph: ['I always start with the "so what".', 'I keep it to one key number and one chart.', 'Then I check they understood by…'] },
  { tr: 'data', q: 'Which tools do you use, and how?', tip: 'Herramienta + para qué + ejemplo. SQL, Python, Excel, dashboards.',
    ph: ['I use SQL every day to…', 'In Python, I mostly…', 'I build dashboards in… to…'] },
  { tr: 'data', q: 'A key metric dropped 10% last week. What do you do?', tip: 'Estructura: comprobar el dato → segmentar → hipótesis → validar → recomendar.',
    ph: ["First, I'd check the data is correct.", "Then I'd break it down by…", 'My hypotheses would be…', "Finally, I'd recommend…"] },
  { tr: 'buy', q: 'Why do you want to work in buying and merchandising?', tip: 'Une tus dos mundos: datos + moda. Este puesto es justo eso.',
    ph: ["It's the perfect mix of my two passions: data and fashion.", 'I love understanding why some products sell and others don\'t.'] },
  { tr: 'buy', q: 'Which brand do you think is doing really well right now, and why?', tip: 'Prepara 1–2 marcas con argumentos de negocio: producto, precio, canal, comunidad.',
    ph: ['I think … is doing really well because…', 'Their pricing strategy…', 'They really understand their customer.'] },
  { tr: 'buy', q: 'A line has sold out in the first week. What do you do?', tip: 'Analiza: ¿demanda real? margen, lead time, tallas → chase stock o producto similar.',
    ph: ["First, I'd look at the sell-through by size and colour.", "If the lead time allows, I'd chase stock.", 'If not, we could look for a similar style.'] },
  { tr: 'buy', q: 'A line is selling slowly. What would you do?', tip: 'Diagnóstico (precio, visibilidad, tallas, tiempo) antes de rebajar.',
    ph: ['Before marking it down, I would check…', 'Maybe it needs better visibility on the homepage.', 'If that doesn\'t work, a targeted markdown…'] },
  { tr: 'buy', q: 'Which KPIs would you track every week?', tip: 'Sell-through, ventas vs. plan, margen, weeks of cover, devoluciones.',
    ph: ['Sales versus plan', 'Full-price sell-through', 'Weeks of cover', 'Return rate', 'Margin'] }
];

// Guion base de "Tell me about yourself" (lo vas mejorando tú)
const TMAY = `I'm Amy, I'm 26 and I'm based in Madrid. I currently work in the marketplace team of a tech company, where I use data to balance supply and demand in real time.

Before that, I studied economics and international relations, and then I did a master's in big data, so I've always been at the crossroads between numbers and business.

What I enjoy most is turning messy data into clear decisions. And outside work, I've always been passionate about fashion.

That's why this role is so exciting for me: it combines my analytical background with an industry I love, and I'm keen to bring that mix to your team.`;

// ---------- RE-TESTS (cada 4 semanas) ----------
const RETESTS = [
  { id: 'A', week: 4, title: 'Re-test 1 (semana 4)',
    grammar: [
      { q: 'I ___ here since 2020.', o: ['work', 'have worked', 'worked', 'am working'], c: 1 },
      { q: 'There ___ some problems with the data.', o: ['was', 'were', 'is', 'has'], c: 1 },
      { q: "I'm looking forward to ___ from you.", o: ['hear', 'hearing', 'heard', 'be hearing'], c: 1 },
      { q: "If I ___ in London, I'd go to more exhibitions.", o: ['live', 'lived', 'would live', 'will live'], c: 1 },
      { q: 'She asked me where I ___.', o: ['live', 'lived', 'do live', 'did live'], c: 1 },
      { q: 'By next June, I ___ my English course.', o: ['will finish', 'will have finished', 'finish', 'have finished'], c: 1 },
      { q: "I wish I ___ to the party last night. It sounded great.", o: ['went', 'had gone', 'would go', 'have gone'], c: 1 },
      { q: '___ the rain, the event was a success.', o: ['Although', 'Despite', 'However', 'Even though'], c: 1 },
      { q: "It's high time you ___ for a new job.", o: ['apply', 'applied', 'will apply', 'are applying'], c: 1 },
      { q: 'The new store, ___ opened in May, is doing well.', o: ['that', 'which', 'what', 'who'], c: 1 },
      { q: 'Rarely ___ such strong results in January.', o: ['we see', 'do we see', 'we do see', 'see we'], c: 1 },
      { q: 'The report needs ___ before Friday.', o: ['to check', 'to be checked', 'checking to', 'be checked'], c: 1 }
    ],
    vocab: [
      { q: 'We ran ___ of medium sizes in two days.', o: ['off', 'out', 'over', 'away'], c: 1 },
      { q: 'Can you ___ me in on what happened?', o: ['fill', 'bring', 'set', 'catch'], c: 0 },
      { q: '"Marked down" means…', o: ['sold out', 'reduced in price', 'written down', 'returned'], c: 1 },
      { q: "We've only got two weeks of ___ on knitwear.", o: ['cover', 'stock', 'time', 'supply'], c: 0 },
      { q: 'I need to ___ up on my application.', o: ['follow', 'look', 'come', 'take'], c: 0 },
      { q: 'Her argument was really ___: everyone agreed.', o: ['compulsory', 'compelling', 'complacent', 'compulsive'], c: 1 },
      { q: 'The forecast was ___ by 4%.', o: ['off', 'out', 'over', 'down'], c: 0 },
      { q: 'He ___ the question about the budget.', o: ['sidelined', 'sidestepped', 'sidetracked', 'sided'], c: 1 }
    ],
    reading: { text: `Online fashion returns have become one of the industry's most expensive problems. In some categories, such as party dresses, up to half of all items bought online are sent back. For retailers, each return means shipping costs, staff time to inspect and repackage the item, and often a lower selling price, as the product may be out of season by the time it is back in stock.\n\nSome brands have started charging customers for returns, a move that was unthinkable a few years ago. Others are investing in better size guides and photos, arguing that most returns are caused by poor fit rather than changing minds. Analysts point out, however, that free returns remain a powerful reason to shop, and that brands which charge risk losing customers to competitors.`,
      qs: [
        { q: 'Why can a returned item end up selling for less?', o: ['It is damaged', 'It may be out of season', 'Customers complain', 'Shipping is expensive'], c: 1 },
        { q: 'Charging for returns used to be…', o: ['common', 'illegal', 'unthinkable', 'cheap'], c: 2 },
        { q: 'According to some brands, most returns are caused by…', o: ['poor fit', 'price', 'late delivery', 'changing minds'], c: 0 },
        { q: 'What risk do analysts mention?', o: ['Higher costs', 'Losing customers', 'Fewer sizes', 'Worse photos'], c: 1 },
        { q: 'The writer\'s attitude is…', o: ['strongly against free returns', 'balanced', 'enthusiastic about charges', 'uninterested'], c: 1 }
      ] },
    listening: { text: "Hi, it's Tom from the buying team. Quick update on the denim launch. The wide-leg jeans have done really well — we're almost sold out in sizes ten and twelve, so I've asked the supplier to repeat them, but the lead time is eight weeks, which isn't ideal. The skinny jeans, on the other hand, are moving much more slowly than we planned. I don't want to mark them down yet; I'd rather move them to the homepage for a couple of weeks and see what happens. Can we catch up on Thursday instead of Wednesday? I've got a supplier visit on Wednesday afternoon.",
      qs: [
        { q: 'Which product is selling well?', o: ['Skinny jeans', 'Wide-leg jeans', 'Denim jackets', 'All denim'], c: 1 },
        { q: 'What is the problem with repeating them?', o: ['The price', 'The lead time', 'The sizes', 'The colour'], c: 1 },
        { q: 'What does Tom want to do with the slow product first?', o: ['Mark it down', 'Return it', 'Give it more visibility', 'Stop selling it'], c: 2 },
        { q: 'When does Tom want to meet?', o: ['Wednesday', 'Thursday', 'In two weeks', 'In eight weeks'], c: 1 },
        { q: 'Why can\'t he meet on Wednesday?', o: ['He is on holiday', 'He has a supplier visit', 'He is ill', 'He has a launch'], c: 1 }
      ] },
    write: 'Write a short email (120–180 words) to a recruiter who contacted you on LinkedIn about a Merchandise Analyst role in London. Thank them, show interest, summarise your profile and suggest a time to talk.',
    speak: 'Tell me about yourself, and explain why you want to work in London. (2 minutes, no notes)' },
  { id: 'B', week: 8, title: 'Re-test 2 (semana 8)',
    grammar: [
      { q: 'How long ___ English?', o: ['do you study', 'have you been studying', 'are you studying', 'did you study'], c: 1 },
      { q: 'The people in my team ___ really supportive.', o: ['is', 'are', 'was', 'has'], c: 1 },
      { q: "I'm not used to ___ presentations in English.", o: ['give', 'giving', 'gave', 'be giving'], c: 1 },
      { q: 'If I had known about the offer, I ___ for it.', o: ['would apply', 'would have applied', 'applied', 'had applied'], c: 1 },
      { q: "I'll send you the file as soon as I ___ to the office.", o: ['will get', 'get', 'got', 'am getting'], c: 1 },
      { q: 'Could you tell me where ___?', o: ['is the meeting room', 'the meeting room is', 'is it the meeting room', 'the meeting room'], c: 1 },
      { q: "I'd rather you ___ the client yet.", o: ["don't tell", "didn't tell", "won't tell", "haven't told"], c: 1 },
      { q: '___ she was tired, she stayed until the end.', o: ['Despite', 'Although', 'In spite of', 'However'], c: 1 },
      { q: 'This time next month, I ___ in London.', o: ['will be living', 'will live', 'live', 'am living'], c: 0 },
      { q: 'She ___ have left already — her coat is still here.', o: ["mustn't", "can't", "shouldn't", "needn't"], c: 1 },
      { q: 'Not only ___ sales, but it also improved margin.', o: ['it increased', 'did it increase', 'increased it', 'it did increase'], c: 1 },
      { q: 'The collection is expected ___ next spring.', o: ['to launch', 'to be launched', 'launching', 'be launched'], c: 1 }
    ],
    vocab: [
      { q: "Let's ___ the decision until we have more data.", o: ['put off', 'put on', 'put out', 'put up'], c: 0 },
      { q: 'Could you ___ on your experience with SQL?', o: ['expand', 'extend', 'enlarge', 'widen'], c: 0 },
      { q: 'The test showed a 6% ___ in conversion.', o: ['uplift', 'upgrade', 'upset', 'upkeep'], c: 0 },
      { q: '"Shortlisted" means…', o: ['rejected', 'selected for the next stage', 'hired', 'interviewed by phone'], c: 1 },
      { q: 'We need to ___ the risk of over-buying.', o: ['militate', 'mitigate', 'migrate', 'mediate'], c: 1 },
      { q: 'I really ___ in fast-paced environments.', o: ['thrive', 'strive', 'drive', 'arrive'], c: 0 },
      { q: 'What can you bring to the ___?', o: ['desk', 'table', 'team', 'room'], c: 1 },
      { q: '"Footfall" is…', o: ['the number of visitors to a store', 'a fall in sales', 'a shoe size', 'a delivery problem'], c: 0 }
    ],
    reading: { text: `For years, resale was seen as a niche: a way for students to sell old clothes or for collectors to trade rare trainers. Today, it is one of the fastest-growing parts of the fashion market. Several major brands now run their own second-hand platforms, buying back items from customers and reselling them online.\n\nThe motivation is not purely environmental. Resale allows brands to keep customers within their ecosystem and to collect valuable data on how long products last. Critics argue, though, that brand-run resale can become a form of "greenwashing" if it is used to justify producing even more new clothes. The real test, they say, is whether brands use what they learn to make fewer, better products.`,
      qs: [
        { q: 'How was resale seen in the past?', o: ['As mainstream', 'As a niche', 'As illegal', 'As luxury'], c: 1 },
        { q: 'Which is NOT a reason brands do resale?', o: ['Keeping customers', 'Collecting data', 'Reducing prices of new clothes', 'Environmental reasons'], c: 2 },
        { q: '"Greenwashing" here means…', o: ['washing clothes in a green way', 'pretending to be more sustainable than you are', 'selling second-hand clothes', 'using recycled materials'], c: 1 },
        { q: 'According to critics, the real test is whether brands…', o: ['sell more second-hand', 'make fewer, better products', 'buy back more items', 'lower their prices'], c: 1 },
        { q: 'The phrase "within their ecosystem" refers to…', o: ['nature', 'the brand\'s own channels', 'the second-hand market', 'other brands'], c: 1 }
      ] },
    listening: { text: "So, thanks for coming in today. Before we start, let me tell you a little bit about the team. We're six people: two buyers, two merchandisers and two analysts. The analyst role is quite hands-on — you'd be pulling the weekly trading report every Monday morning, which is presented to the directors at eleven, so it has to be accurate and on time. Beyond that, you'd support the buyers with range planning for the next season. To be honest, the first couple of months can be a bit overwhelming, but we pair every new joiner with a buddy, and most people find their feet quite quickly. Does that sound like the kind of environment you'd enjoy?",
      qs: [
        { q: 'How many analysts are in the team?', o: ['One', 'Two', 'Four', 'Six'], c: 1 },
        { q: 'When is the trading report presented?', o: ['Monday at 11', 'Every morning', 'Friday afternoon', 'Monthly'], c: 0 },
        { q: 'What else would the analyst do?', o: ['Visit suppliers', 'Support range planning', 'Manage stores', 'Design products'], c: 1 },
        { q: 'How might the first months feel?', o: ['Boring', 'Overwhelming', 'Easy', 'Lonely'], c: 1 },
        { q: '"Find their feet" means…', o: ['get lost', 'become comfortable and confident', 'walk a lot', 'leave the company'], c: 1 }
      ] },
    write: 'Write 150–200 words: "Is fast fashion worth it?" Give your opinion, one argument against it, and what you would change if you worked as a buyer.',
    speak: 'Answer in 2 minutes: "Tell me about a time you worked under pressure." Use the STAR method.' }
];
// Semana 12: usaremos una versión nueva (pídela en la sesión de inglés).

// ---------- PLAN FRIENDS ----------
const FRIENDS = [
  { from: 1, to: 3, t: 'Etapa 1 · Subtítulos en INGLÉS', d: 'Nunca más en español. Cuando una frase te guste, páusala y repítela en voz alta imitando la entonación: como te sabes los diálogos, es shadowing perfecto.' },
  { from: 4, to: 6, t: 'Etapa 2 · Primero sin subtítulos', d: 'Ve cada episodio primero SIN subtítulos. Luego activa los subtítulos en inglés solo para las escenas que no pillaste. 1 frase nueva al día a tus tarjetas.' },
  { from: 7, to: 9, t: 'Etapa 3 · Sin subtítulos', d: 'Sin subtítulos. Si te pierdes, rebobina 10 segundos antes de activarlos. Además, 1 episodio a la semana de algo NUEVO (te propongo abajo).' },
  { from: 10, to: 99, t: 'Etapa 4 · Friends + series nuevas', d: 'Friends sin subtítulos, como descanso. El listening nuevo de verdad: 2–3 episodios a la semana de una serie nueva con subtítulos en inglés.' }
];
const NEW_SHOWS = [
  { t: 'Ted Lasso', d: 'Comedia con acento británico y americano mezclados. Ideal para Londres.' },
  { t: 'Emily in Paris', d: 'Moda y marketing, inglés americano claro.' },
  { t: 'The Devil Wears Prada (película)', d: 'Moda y el mundo de una revista. Vocabulario de la industria.' },
  { t: 'How I Met Your Mother', d: 'El "siguiente Friends": mismo estilo, diálogos nuevos.' },
  { t: 'Brooklyn Nine-Nine', d: 'Episodios cortos, ritmo rápido, mucho humor de oficina.' }
];

// ---------- LISTENING NUEVO (lo que entrena tu oído de verdad) ----------
const LISTEN_SOURCES = [
  { t: 'BBC Learning English · 6 Minute English', lvl: 'B1–B2', d: 'Episodios de 6 min con transcripción. Tu punto de partida.', url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english' },
  { t: 'TED · charlas de moda', lvl: 'B2–C1', d: 'Con transcripción. Empieza por la de Amy Powney (la del diagnóstico).', url: 'https://www.ted.com/topics/fashion' },
  { t: 'TED · charlas de negocio y datos', lvl: 'B2–C1', d: 'Para vocabulario de entrevistas.', url: 'https://www.ted.com/topics/business' },
  { t: 'BBC Learning English · The English We Speak', lvl: 'B1–B2', d: '3 minutos sobre una expresión coloquial británica.', url: 'https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak' }
];
const LISTEN_METHOD = [
  '1.ª escucha sin texto: ¿qué has entendido? Apúntalo en 1 frase.',
  '2.ª escucha sin texto: intenta pillar los números y los nombres.',
  '3.ª escucha leyendo la transcripción: marca lo que NO oíste.',
  'Las 3 palabras o frases nuevas más útiles → a tus tarjetas.',
  'Repite en voz alta 2–3 frases imitando su ritmo (shadowing).'
];

// ---------- HITOS SEMANALES (medibles) ----------
const MILESTONES = [
  { w: 1, t: 'Diagnóstico completo y grabación del día 1', k: ['Speaking del diagnóstico grabado y enviado', '20 tarjetas empezadas', 'Tell me about yourself v1 escrito'] },
  { w: 2, t: 'Fuera los calcos', k: ['Calcos y since/for con ≥80 % en el drill', 'Tell me about yourself dicho en 90 s sin leer', '3 listenings de 6 Minute English'] },
  { w: 3, t: 'Primeras respuestas de entrevista', k: ['5 respuestas de entrevista escritas y corregidas', 'Shadowing con media ≥75 %', 'Friends etapa 1 cumplida'] },
  { w: 4, t: 'RE-TEST 1 + grabación del día 30', k: ['Re-test 1 hecho', 'Listening sube medio nivel (objetivo B1)', 'Compara día 1 vs día 30'] },
  { w: 5, t: 'Hablar sin guion', k: ['3 respuestas STAR dichas sin leer', '1 TED entera con el método', 'Friends etapa 2'] },
  { w: 6, t: 'Fluidez', k: ['≥100 palabras/min en speaking libre', '10 respuestas de entrevista preparadas', 'Errores -ing y concordancia ≥85 %'] },
  { w: 7, t: 'Entrevista técnica', k: ['Responder 4 preguntas de tu track (data o buying) en voz alta', '120 tarjetas en repaso'] },
  { w: 8, t: 'RE-TEST 2 + simulacro de entrevista', k: ['Re-test 2 hecho', 'Simulacro de 20 min con la sesión de inglés', 'Envía 2–3 candidaturas reales'] },
  { w: 9, t: 'Entrevistas reales', k: ['15 preguntas preparadas', 'Speaking libre ≥110 palabras/min', 'Friends etapa 3'] },
  { w: 10, t: 'Pulir', k: ['Preguntas para el entrevistador preparadas', 'Cover letter final corregida'] },
  { w: 11, t: 'Presión', k: ['2 simulacros con preguntas sorpresa', '20 preguntas sin bloquearte'] },
  { w: 12, t: 'RE-TEST 3 · LISTA PARA ENTREVISTAS', k: ['Re-test 3', 'Grabación día 84 vs día 1', 'Te presentas a ofertas sin echarte atrás'] }
];

// ---------- SPEAKING SIN DEPENDER DE NADIE ----------
const SPEAK_IDEAS = [
  { t: 'Monólogo de 2 minutos', d: 'Elige una pregunta, pon el temporizador y habla sin parar. Si te bloqueas, di "Let me think…" y sigue. La app te dice palabras/minuto y muletillas.' },
  { t: 'Narra tu vida en voz alta', d: 'Mientras cocinas o te vistes, describe lo que haces: "Now I\'m chopping the onions…". 5 minutos al día y el inglés se vuelve automático.' },
  { t: 'Shadowing de Friends', d: 'Te sabes los diálogos: pon una escena, para tras cada frase y repítela con la misma entonación. Es la mejor forma de mejorar ritmo y pronunciación.' },
  { t: 'Notas de voz a ti misma', d: 'En vez de escribir la lista de la compra o tus planes, mándate una nota de voz en inglés.' },
  { t: 'Explica un TikTok', d: 'Cuando veas un TikTok que te guste, resúmelo en voz alta en inglés en 30 segundos. Cambias scroll por práctica.' },
  { t: 'Entrevista simulada con la app', d: 'Modo Entrevista: la app te hace la pregunta en voz alta (también entrenas el oído) y tú respondes como si fuera real.' },
  { t: 'Habla con Claude', d: 'Usa el modo voz de la app de Claude en el móvil: pídele que sea un recruiter de Londres y que te corrija al final.' },
  { t: 'Piensa en inglés', d: 'En el metro, describe mentalmente a 3 personas: qué llevan, de qué marca podría ser y cuánto costaría.' }
];
