const fs = require('fs');

function parseCSV(text) {
  const rows = [];
  let current = '';
  let inQuote = false;
  let row = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuote && text[i+1] === '"') {
        current += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === ',' && !inQuote) {
      row.push(current);
      current = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuote) {
      if (ch === '\r' && text[i+1] === '\n') i++;
      if (current || row.length) {
        row.push(current);
        rows.push(row);
        row = [];
        current = '';
      }
    } else {
      current += ch;
    }
  }
  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }
  return rows;
}

function parseScale(val) {
  const n = Number(val);
  return !isNaN(n) && n >= 1 && n <= 5 ? n : null;
}

function parseYesNo(val) {
  const v = val?.trim()?.toLowerCase();
  if (!v) return null;
  if (v === 'sim') return 'sim';
  if (v.startsWith('n')) return 'nao';
  if (v.startsWith('talvez') || v.startsWith('depende')) return 'talvez';
  // Long text responses starting with known patterns
  if (v.length > 20) return 'talvez'; // detailed answers count as engagement
  return null;
}

function yesPercent(arr) {
  const valid = arr.filter(v => v !== null);
  if (valid.length === 0) return 0;
  return Math.round((valid.filter(v => v === 'sim').length / valid.length) * 100);
}

function scaleAvg(arr) {
  const valid = arr.filter(v => v !== null);
  if (valid.length === 0) return 0;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

function yesNoToScale(arr) {
  return arr.map(v => {
    if (v === 'sim') return 5;
    if (v === 'talvez') return 3;
    if (v === 'nao') return 1;
    return null;
  });
}

function processSurvey(filePath, edition, date, offset) {
  const text = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(text);
  const header = rows[0];
  const data = rows.slice(1).filter(r => r.length > 5);

  const o = offset;

  const culturaClareza = data.map(r => parseScale(r[1 + o]));
  const confortoEquipe = data.map(r => parseScale(r[2 + o]));
  const diaAgradavel = data.map(r => parseScale(r[3 + o]));
  const impactoVida = data.map(r => parseScale(r[4 + o]));
  const pertencimento = data.map(r => parseYesNo(r[5 + o]));
  const gestorClaro = data.map(r => parseYesNo(r[6 + o]));
  const comunicacaoTransp = data.map(r => parseYesNo(r[7 + o]));
  const entregasValorizadas = data.map(r => parseYesNo(r[8 + o]));
  const opiniaoConsiderada = data.map(r => parseYesNo(r[9 + o]));
  const liderIncentiva = data.map(r => parseYesNo(r[10 + o]));
  const satisfacaoFuncoes = data.map(r => parseScale(r[11 + o]));
  const valorAtividades = data.map(r => parseYesNo(r[12 + o]));
  const crescimento = data.map(r => parseYesNo(r[17 + o]));
  const planoCarreira = data.map(r => parseScale(r[18 + o]));
  const homeOffice = data.map(r => parseScale(r[25 + o]));
  const satisfRemuneracao = data.map(r => parseYesNo(r[30 + o]));
  const salarioJusto = data.map(r => parseYesNo(r[31 + o]));
  const felicidade = data.map(r => parseScale(r[36 + o]));
  const orgulho = data.map(r => parseYesNo(r[37 + o]));
  const freqSobrecarga = data.map(r => parseScale(r[15 + o]));
  const workloadInverted = freqSobrecarga.map(v => v !== null ? 6 - v : null);

  const leadershipScale = [
    ...yesNoToScale(gestorClaro),
    ...yesNoToScale(comunicacaoTransp),
    ...yesNoToScale(entregasValorizadas),
    ...yesNoToScale(opiniaoConsiderada),
    ...yesNoToScale(liderIncentiva),
  ];

  const communicationScale = [
    ...yesNoToScale(comunicacaoTransp),
    ...yesNoToScale(entregasValorizadas),
    ...yesNoToScale(opiniaoConsiderada),
  ];

  const sugestoes = data.map(r => r[34 + o]?.trim()).filter(v => v && v.length > 3);
  const pontosAtencao = data.map(r => r[35 + o]?.trim()).filter(v => v && v.length > 3);
  const futuro = data.map(r => r[38 + o]?.trim()).filter(v => v && v.length > 3);
  const beneficios = data.map(r => r[32 + o]?.trim()).filter(v => v && v.length > 3);
  const cargosAlvo = data.map(r => r[21 + o]?.trim()).filter(Boolean);

  const result = {
    edition,
    date,
    totalResponses: data.length,
    culturaClareza: scaleAvg(culturaClareza),
    confortoEquipe: scaleAvg(confortoEquipe),
    diaAgradavel: scaleAvg(diaAgradavel),
    workLifeBalance: scaleAvg(impactoVida),
    satisfacaoFuncoes: scaleAvg(satisfacaoFuncoes),
    planoCarreira: scaleAvg(planoCarreira),
    homeOffice: scaleAvg(homeOffice),
    felicidade: scaleAvg(felicidade),
    workloadScore: scaleAvg(workloadInverted),
    pertencimento: yesPercent(pertencimento),
    gestorClaro: yesPercent(gestorClaro),
    comunicacaoTransparente: yesPercent(comunicacaoTransp),
    entregasValorizadas: yesPercent(entregasValorizadas),
    opiniaoConsiderada: yesPercent(opiniaoConsiderada),
    liderIncentiva: yesPercent(liderIncentiva),
    valorAtividades: yesPercent(valorAtividades),
    crescimento: yesPercent(crescimento),
    satisfRemuneracao: yesPercent(satisfRemuneracao),
    salarioJusto: yesPercent(salarioJusto),
    orgulho: yesPercent(orgulho),
    overallScore: scaleAvg([
      ...culturaClareza, ...confortoEquipe, ...diaAgradavel, ...impactoVida,
      ...satisfacaoFuncoes, ...planoCarreira, ...homeOffice, ...felicidade,
    ].filter(v => v !== null)),
    leadershipScore: scaleAvg(leadershipScale.filter(v => v !== null)),
    communicationScore: scaleAvg(communicationScale.filter(v => v !== null)),
    careerClarityScore: scaleAvg(planoCarreira),
    distributions: {
      felicidade: [1,2,3,4,5].map(n => felicidade.filter(v => v === n).length),
      culturaClareza: [1,2,3,4,5].map(n => culturaClareza.filter(v => v === n).length),
      confortoEquipe: [1,2,3,4,5].map(n => confortoEquipe.filter(v => v === n).length),
      satisfacaoFuncoes: [1,2,3,4,5].map(n => satisfacaoFuncoes.filter(v => v === n).length),
      planoCarreira: [1,2,3,4,5].map(n => planoCarreira.filter(v => v === n).length),
      homeOffice: [1,2,3,4,5].map(n => homeOffice.filter(v => v === n).length),
      workLifeBalance: [1,2,3,4,5].map(n => impactoVida.filter(v => v === n).length),
    },
    openResponses: {
      sugestoesDiretoria: sugestoes,
      pontosAtencao,
      futuroTBO: futuro,
      beneficiosFalta: beneficios,
      cargosAlvo,
    },
  };

  return result;
}

const path = require('path');
const s1 = processSurvey(path.join(__dirname, 'survey1.csv'), 1, '2022-07', 0);
const s2 = processSurvey(path.join(__dirname, 'survey2.csv'), 2, '2023-12', 0);
const s3 = processSurvey(path.join(__dirname, 'survey3.csv'), 3, '2024-10', 5);

console.log(JSON.stringify([s1, s2, s3], null, 2));
