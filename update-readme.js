import fs from 'fs/promises';

const API_URL = "https://api.github.com";

try {
    const username = process.env.USERNAME;
    const url = `${API_URL}/${username}/repos?per_page=200`;

    const response = await fetch(url);
    const repos = await response.json();
    const repoOfTheWeek = repos[Math.floor(Math.random() * (repos.length - 1))];

    let updates = `<!-- start repo of the week -->\n\n`;
    const { name, full_name, description } = repoOfTheWeek;
    const readme_url = `${API_URL}/repos/${full_name}/contents/README.md`;
    const res = await fetch(readme_url);
    const json = await res.json();
    const readme_encoded = Buffer.from(json.content, 'base64');
    const readme = readme_encoded.toString('utf-8', 0, Math.min(readme_encoded.byteLength, 800));
    const row = `## Repo of the week\n\n---\n\n### ${name}\n\n${description}\n\n---\n\n${readme}\n\n---\n\n`;

    updates = updates.concat(row);
    updates = updates.concat('<!-- end repo of the week -->');

    // Rewrite README with new post content
    const currentText = await fs.readFile('README.md', 'utf8');
    const repoSection = /<!-- start repo of the week -->[\s\S]*<!-- end repo of the week -->/g;
    const newText = currentText.replace(repoSection, updates);

    await fs.writeFile('README.md', newText);
} catch (error) {
  console.error('there was an error:', error.message);
}
