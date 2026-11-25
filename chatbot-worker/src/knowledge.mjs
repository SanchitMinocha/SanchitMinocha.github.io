import portfolios from '../../assets/data/portfolios.json' with { type: 'json' };
import publications from '../../assets/data/publications.json' with { type: 'json' };
import personal from '../knowledge/personal.json' with { type: 'json' };

const SITE = 'https://sanchitminocha.github.io';
export const KNOWLEDGE_VERSION = '2026-11-24-persona-v4';

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function stableId(prefix, index) {
  return `${prefix}-${String(index + 1).padStart(3, '0')}`;
}

function add(chunks, id, title, text, metadata = {}) {
  const content = stripHtml(text);
  if (content.length < 24) return;
  const maxChars = 1800;
  let remaining = content;
  let part = 1;
  while (remaining.length > maxChars) {
    let cut = remaining.lastIndexOf('. ', maxChars);
    if (cut < maxChars * 0.6) cut = remaining.lastIndexOf(' ', maxChars);
    if (cut < maxChars * 0.6) cut = maxChars;
    const textPart = remaining.slice(0, cut + 1).trim();
    chunks.push({ id: `${id}-part-${part}`, title, text: textPart, ...metadata });
    remaining = remaining.slice(cut + 1).trim();
    part += 1;
  }
  if (remaining.length >= 24) chunks.push({ id: part === 1 ? id : `${id}-part-${part}`, title, text: remaining, ...metadata });
}

function list(value) {
  return Array.isArray(value) ? value.join(', ') : value;
}

function buildPersonalChunks(chunks) {
  const p = personal.profile;
  add(chunks, 'profile-current', 'Current profile and research', [
    `${p.name} (${p.pronouns}) is a ${p.current_role} in ${p.location}. Current role and position: Postdoctoral Associate. Current employer and workplace: Massachusetts Institute of Technology (MIT).`,
    p.summary,
    `Research areas: ${list(p.research_areas)}.`,
    `Professional contact: ${p.professional_email}.`,
    `Website: ${p.links.website} MIT profile: ${p.links.mit_profile} GitHub: ${p.links.github} LinkedIn: ${p.links.linkedin} ORCID: ${p.links.orcid}`
  ].join(' '), { source: 'Curated profile', url: p.links.mit_profile, type: 'profile' });

  personal.education.forEach((item, index) => add(
    chunks,
    stableId('education', index),
    `${item.degree} — ${item.institution}`,
    `${item.degree} at ${item.institution}, ${item.period}. Status: ${item.status || 'completed'}. ${item.advisor ? `Advisor: ${item.advisor}.` : ''} ${item.thesis ? `Thesis: ${item.thesis}.` : ''} ${item.recognition ? `Recognition: ${list(item.recognition)}.` : ''} Focus: ${list(item.focus)}.`,
    { source: 'Curated education', url: SITE, type: 'education' }
  ));

  personal.experience.forEach((item, index) => add(
    chunks,
    stableId('experience', index),
    `${item.role} — ${item.organization}`,
    `${item.role} at ${item.organization}, ${item.period}. ${item.work}`,
    { source: 'Curated experience', url: item.organization.startsWith('MIT') ? p.links.mit_profile : SITE, type: 'experience' }
  ));

  Object.entries(personal.skills).forEach(([group, values], index) => add(
    chunks,
    stableId('skills', index),
    `Skills — ${group.replaceAll('_', ' ')}`,
    `Sanchit's ${group.replaceAll('_', ' ')} skills include ${list(values)}.`,
    { source: 'Curated skills', url: SITE, type: 'skills' }
  ));

  add(chunks, 'personal-interests', 'Interests and hobbies', `Sanchit's interests include ${list(personal.interests)}.`, {
    source: 'Curated personal profile', url: SITE, type: 'interests'
  });
  add(chunks, 'personal-personality', 'Personality and working style', `Sanchit is ${list(personal.personality_traits)}.`, {
    source: 'Pikachu knowledge base', url: SITE, type: 'personality'
  });
  add(chunks, 'personal-favorites', 'Personal interests and favorites', [
    `Sanchit's favorite food is ${personal.favorites.food}.`,
    `His favorite book is ${personal.favorites.book}.`,
    `Television shows he enjoys include ${list(personal.favorites.television)}.`,
    `His favorite Pokémon is ${personal.favorites.pokemon}, which inspired the name of his AI assistant.`,
    `Video games he enjoys include ${list(personal.favorites.video_games)}.`
  ].join(' '), { source: 'Pikachu knowledge base', url: SITE, type: 'interests' });
  add(chunks, 'personal-philosophy', 'Personal philosophy', personal.personal_philosophy.join(' '), {
    source: 'Pikachu knowledge base', url: SITE, type: 'philosophy'
  });
  add(chunks, 'research-philosophy', 'Research philosophy', personal.research_philosophy.join(' '), {
    source: 'Curated personal profile', url: SITE, type: 'philosophy'
  });
  add(chunks, 'future-goals', 'Professional goals', personal.goals.join(' '), {
    source: 'Curated personal profile', url: SITE, type: 'goals'
  });

  personal.stories.forEach((item, index) => add(chunks, stableId('story', index), item.title, item.text, {
    source: 'Curated personal story', url: SITE, type: 'story'
  }));
  personal.additional_projects.forEach((item, index) => add(chunks, stableId('additional-project', index), item.name, `${item.name}: ${item.description} Repository: ${item.url}`, {
    source: 'Pikachu knowledge base', url: item.url, type: 'project'
  }));

  const ai = personal.assistant;
  add(chunks, 'about-pikachu', ai.name, `${ai.purpose} ${ai.identity} ${ai.history} Built by ${ai.creator}. Repository: ${ai.repository}`, {
    source: 'Pikachu project', url: ai.repository, type: 'assistant'
  });
}

function buildProjectChunks(chunks) {
  portfolios.forEach((item, index) => {
    const details = item.details || {};
    const url = details.liveProjectLink || details.codeLink || `${SITE}/${item.detailPage || ''}`;
    add(chunks, stableId('portfolio-summary', index), item.title, [
      `Project: ${item.title}.`, item.meta, item.tagline, item.description, item.impact,
      details.techStack?.length ? `Technologies: ${details.techStack.join(', ')}.` : '',
      `Project page: ${url}`
    ].filter(Boolean).join(' '), { source: 'Portfolio', url, type: 'project' });

    add(chunks, stableId('portfolio-detail', index), `${item.title} — problem and approach`, [
      details.overviewBase, details.overviewExpanded, details.challenge ? `Challenge: ${details.challenge}` : '',
      details.solution ? `Approach: ${details.solution}` : '',
      details.codeLink ? `Code: ${details.codeLink}` : '', details.paperLink ? `Publication: ${details.paperLink}` : '',
      details.docsLink ? `Documentation: ${details.docsLink}` : ''
    ].filter(Boolean).join(' '), { source: 'Portfolio details', url, type: 'project' });
  });
}

function buildPublicationChunks(chunks) {
  publications.forEach((item, index) => {
    const url = item.doi || SITE;
    add(chunks, stableId('publication', index), item.title, [
      `Publication: ${item.title}.`, item.authors ? `Authors: ${stripHtml(item.authors)}.` : '',
      item.journal ? `Venue: ${item.journal}.` : '', item.year ? `Year: ${item.year}.` : '',
      item.abstract ? `Abstract: ${item.abstract}` : '', item.doi ? `Source: ${item.doi}` : ''
    ].filter(Boolean).join(' '), { source: 'Publications', url, type: 'publication' });
  });
}

export function buildKnowledgeChunks() {
  const chunks = [];
  buildPersonalChunks(chunks);
  buildProjectChunks(chunks);
  buildPublicationChunks(chunks);
  return chunks;
}

export const KNOWLEDGE_CHUNKS = Object.freeze(buildKnowledgeChunks());
