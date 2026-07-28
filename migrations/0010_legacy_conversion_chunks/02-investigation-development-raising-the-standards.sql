-- Legacy conversion chunk 02 of 21
-- Paste this full file into Cloudflare D1 Console and click Execute.
-- Safe to rerun.

INSERT INTO articles (id, destination, href, title, subtitle, article_type, author, source, body_html, article_html, labels, status, created_by, updated_at)
SELECT 'legacy-investigation-development-raising-the-standards', 'investigation-development-series.html', 'published-article.html?id=legacy-investigation-development-raising-the-standards', 'Raising The Standards Of Paranormal Investigation', 'Founder Statement', 'Field Article', 'Todd Wayne', 'investigation-development-raising-the-standards.html', '<section class="lesson-reading-section series-article">
    <article class="lesson-reading-block">
        <h3>Thirty Years In The Field</h3>
        <div class="lesson-reading-copy">
            <p>I have spent over 30 years in the field of paranormal investigation. Not chasing shadows. Not looking for attention. But learning, documenting, questioning, and growing.</p>
            <p>Over the years, I have seen incredible experiences. Some challenge explanation, and many do not. Some lay claim to plausible paranormal activity.</p>
            <p>That is exactly the point. Experience alone is not evidence. Belief is not validation. Assumption has no place in a professional investigation.</p>
        </div>
    </article>

    <article class="lesson-reading-block">
        <h3>What The Field Needs</h3>
        <div class="lesson-reading-copy">
            <p>What this field needs is not more hype. It needs structure. It needs accountability. It needs standards.</p>
            <p>I took an oath to myself that I would do this the right way: to help people find the cause behind their claims truthfully and honestly.</p>
            <p>I made that oath so I would never contribute to unnecessary fear, never mislead a client, and never cause mental anguish by reinforcing something that is not truly there.</p>
            <p>I follow that oath to this day, because what we do impacts real people, and that responsibility should never be taken lightly.</p>
        </div>
    </article>

    <article class="lesson-reading-block">
        <h3>The Cost Of Integrity</h3>
        <div class="lesson-reading-copy">
            <p>When you choose integrity in this field, you lose something. You lose the wow factor. You lose instant gratification. You lose the audience that only wants to be entertained.</p>
            <p>Truth does not always impress people, and real investigation does not always look exciting. But it is real, and that matters more than anything.</p>
        </div>
    </article>

    <article class="lesson-reading-block">
        <h3>Belief Is Not Proof</h3>
        <div class="lesson-reading-copy">
            <p>Many people in this field have already decided what they believe is happening. They treat belief as proof and then look for others to agree with them.</p>
            <p>That is not investigation. That is validation seeking.</p>
            <p>A real investigator does the opposite. They question everything. They challenge assumptions. They look for what is, not what they want it to be.</p>
        </div>
    </article>

    <article class="lesson-reading-block">
        <h3>Why Paranormal Pro Was Created</h3>
        <div class="lesson-reading-copy">
            <p>That is why I created Paranormal Pro. Not to change how you investigate, but to strengthen how you document, analyze, and present your findings.</p>
            <p>If we want to be taken seriously by the public, by science, and even by each other, then we have to hold ourselves to a higher standard.</p>
            <p>That means eliminating natural causes before considering the unexplained, documenting every step of the investigation, correlating environmental and situational data, and letting the evidence speak instead of the narrative.</p>
        </div>
    </article>

    <article class="lesson-reading-block">
        <h3>Credibility Is The Goal</h3>
        <div class="lesson-reading-copy">
            <p>This is not about proving the paranormal. It is about proving that we, as investigators, are credible.</p>
            <p>The Paranormal Initiative is about raising the bar for all of us, and I am committed to leading that charge.</p>
            <p><strong>Todd Wayne</strong><br>The Paranormal Initiative</p>
        </div>
    </article>
</section>', '', 'Imported, Legacy Site Page', 'published', c.id, CURRENT_TIMESTAMP
FROM contributors c
WHERE c.username = 'Todd_Wayne'
ON CONFLICT(id) DO UPDATE SET
  destination = excluded.destination,
  href = excluded.href,
  title = excluded.title,
  subtitle = excluded.subtitle,
  article_type = excluded.article_type,
  author = excluded.author,
  source = excluded.source,
  body_html = excluded.body_html,
  article_html = excluded.article_html,
  labels = excluded.labels,
  status = excluded.status,
  updated_at = CURRENT_TIMESTAMP;

SELECT 'Raising The Standards Of Paranormal Investigation' AS converted_article;
