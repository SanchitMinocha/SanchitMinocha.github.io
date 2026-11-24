import portfolios from '../../assets/data/portfolios.json' with { type: 'json' };
import publications from '../../assets/data/publications.json' with { type: 'json' };

const SITE = 'https://sanchitminocha.github.io';

const PROFILE = `
Sanchit Minocha is a Postdoctoral Associate at MIT's Center for Sustainability Science and Strategy (CS3).
He works at the intersection of environment, society, and AI, developing computational approaches to advance actionable science and address sustainability challenges.
His work spans human–Earth system science, geospatial data science, machine learning, satellite Earth observation, water resources, reservoirs, and evidence-based decision-making.
He earned a PhD and MS in Civil and Environmental Engineering at the University of Washington and an Integrated M.Tech in Geophysical Technology at IIT Roorkee. His past research affiliations include SASWE at the University of Washington and NASA Jet Propulsion Laboratory.
Profile: ${SITE}/
MIT CS3 profile: https://cs3.mit.edu/about-us/personnel/minocha-sanchit
PhD defense page: ${SITE}/phd-defense/
Contact: msanchit@mit.edu
`;

function terms(text) {
  return new Set(text.toLowerCase().match(/[a-z0-9]{3,}/g) || []);
}

function score(queryTerms, text) {
  const itemTerms = terms(text);
  let total = 0;
  for (const term of queryTerms) if (itemTerms.has(term)) total += 1;
  return total;
}

function relevant(items, query, textForItem, limit) {
  const queryTerms = terms(query);
  return items
    .map((item, index) => ({ item, index, score: score(queryTerms, textForItem(item)) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ item }) => item);
}

function projectUrl(detailPage = '') {
  return `${SITE}/${detailPage.replace(/^\//, '')}`;
}

export function buildPortfolioContext(query) {
  const selectedProjects = relevant(
    portfolios,
    query,
    item => `${item.title} ${item.description}`,
    4
  );
  const selectedPublications = relevant(
    publications,
    query,
    item => `${item.title} ${item.journal}`,
    6
  );

  const projectText = selectedProjects.map(item =>
    `- ${item.title}: ${item.description} More: ${projectUrl(item.detailPage)}`
  ).join('\n');

  const publicationText = selectedPublications.map(item => {
    const source = item.doi ? ` Source: ${item.doi}` : '';
    return `- ${item.title}. ${item.journal}${source}`;
  }).join('\n');

  return `${PROFILE.trim()}\n\nSelected projects:\n${projectText}\n\nSelected publications:\n${publicationText}`;
}
