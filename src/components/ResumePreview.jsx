import React, { memo, useRef, useState, useLayoutEffect } from 'react';

const A4_W = 794;
const A4_H = 1123;
const PAGE_GAP = 20;

function ResumePreview({
  data,
  pageMode = 'auto',
  scale = 1,
  spacingDensity = 'normal',
  fontFamily = 'playfair'
}) {
  const { header, theme, summary, skills, experiences, education, languages } = data;

  const headerMeasureRef = useRef(null);
  const bodyMeasureRef   = useRef(null);
  const [pageGroups, setPageGroups] = useState(null);

  const bodyFont =
    fontFamily === 'inter' ? "'Inter', -apple-system, sans-serif"
    : fontFamily === 'lora' ? "'Lora', Georgia, serif"
    : "'Lora', 'Merriweather', 'Times New Roman', serif";

  const titleFont =
    fontFamily === 'inter' ? "'Inter', sans-serif"
    : fontFamily === 'lora' ? "'Lora', 'Playfair Display', serif"
    : "'Cinzel', 'Playfair Display', 'Times New Roman', serif";

  const fontStyle      = { fontFamily: bodyFont };
  const titleFontStyle = { fontFamily: titleFont };

  const SectionHeader = ({ title }) => (
    <div className="cv-section-header-wrap">
      <div className="cv-section-divider-top"
        style={{ borderColor: theme.borderColor || '#000000' }} />
      <h2 className="cv-section-title"
        style={{ ...titleFontStyle, color: theme.headingColor || '#000000', borderColor: theme.borderColor || '#000000' }}>
        {title}
      </h2>
      <div className="cv-section-divider-bottom"
        style={{ borderColor: theme.borderColor || '#000000' }} />
    </div>
  );

  const HeaderBanner = () => (
    <div className="cv-header-banner"
      style={{ backgroundColor: theme.bannerColor, color: theme.bannerTextColor }}>
      <div className="cv-header-left">
        <h1 className="cv-name" style={titleFontStyle}>{header.fullName}</h1>
        <div className="cv-job-title"
          style={{ color: theme.bannerSubColor || '#d2e7ec', ...titleFontStyle }}>
          {header.jobTitle}
        </div>
        <ul className="cv-contact-list">
          {header.contacts.map((c, i) => (
            <li key={i} className="cv-contact-item">
              {!header.hideContactBullets && <span className="cv-contact-bullet">•</span>}
              <span className="cv-contact-label">{c.label} :</span>
              {c.link ? (
                <a href={c.link}
                  className={`cv-contact-value ${c.label.toLowerCase().includes('mail') ? 'cv-contact-link' : ''}`}
                  style={{ color: theme.bannerTextColor }}
                  target="_blank" rel="noreferrer">
                  {c.value}
                </a>
              ) : (
                <span className="cv-contact-value">{c.value}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {header.showPhoto && (
        <div className="cv-header-right">
          <div className="cv-photo-frame">
            {header.photoUrl ? (
              /* Background image instead of <img>: html2canvas ignores object-fit and would stretch the photo in the PDF */
              <div
                role="img"
                aria-label={header.fullName}
                className="cv-photo-img"
                data-zoom={header.photoZoom ?? 1}
                data-pos-x={header.photoPosX ?? 50}
                data-pos-y={header.photoPosY ?? 0}
                style={{
                  backgroundImage: `url("${header.photoUrl}")`,
                  backgroundPosition: `${header.photoPosX ?? 50}% ${header.photoPosY ?? 0}%`,
                  transform: `scale(${header.photoZoom ?? 1})`,
                  transformOrigin: `${header.photoPosX ?? 50}% ${header.photoPosY ?? 0}%`
                }}
              />
            ) : (
              <div className="cv-photo-placeholder">ADD PHOTO</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const buildBlocks = () => {
    const blocks = [];

    blocks.push(
      <section key="summary" className="cv-section">
        <SectionHeader title={summary.title} />
        <p className="cv-summary-text">{summary.content}</p>
      </section>
    );

    blocks.push(
      <section key="skills" className="cv-section">
        <SectionHeader title={skills.title} />
        {/* Grouped format (e.g. Fazil): heading + bullets per category */}
        {skills.groups ? (
          <div className="cv-skills-groups-grid" style={{ gridTemplateColumns: `repeat(${skills.groups.length}, 1fr)` }}>
            {skills.groups.map((group, gIdx) => (
              <div key={gIdx} className="cv-skills-group">
                <div className="cv-skills-group-heading">{group.heading}</div>
                <ul className="cv-skills-list">
                  {group.items.map((skill, sIdx) => (
                    <li key={sIdx} className="cv-skill-item">
                      <span className="cv-bullet">•</span>
                      <span className="cv-skill-text">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          /* Legacy column format (Asrif / Rifkan) */
          <div className="cv-skills-grid">
            {skills.columns.map((col, colIdx) => (
              <div key={colIdx} className="cv-skills-col">
                <ul className="cv-skills-list">
                  {col.map((skill, sIdx) => (
                    <li key={sIdx} className="cv-skill-item">
                      <span className="cv-bullet">•</span>
                      <span className="cv-skill-text">{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        {skills.industries && skills.industries.length > 0 && (
          <div className="cv-skills-industries">
            <span className="cv-skills-industries-label">INDUSTRIES:</span> {skills.industries.join(' · ')}
          </div>
        )}
      </section>
    );

    // Each job is split into page-breakable pieces: the job header kept together
    // with its first bullets, then one piece per remaining bullet. Wrapper margins
    // are flushed between pieces so the result looks the same as one continuous job.
    const KEEP_WITH_HEADER = 2;
    experiences.forEach((exp, expIdx) => {
      const isFirst = expIdx === 0;
      const bullets = exp.sections.flatMap((sec, secIdx) =>
        sec.items.map((item, itIdx) => ({
          sec,
          secIdx,
          item,
          itIdx,
          firstInSec: itIdx === 0,
          lastInSec: itIdx === sec.items.length - 1
        }))
      );
      const pieces = [bullets.slice(0, KEEP_WITH_HEADER)];
      bullets.slice(KEEP_WITH_HEADER).forEach((b) => pieces.push([b]));

      pieces.forEach((piece, pieceIdx) => {
        const isHeadPiece = pieceIdx === 0;
        const isLastPiece = pieceIdx === pieces.length - 1;
        const flush = (top, bottom) =>
          `${top ? ' cv-flush-top' : ''}${bottom ? ' cv-flush-bottom' : ''}`;

        // Group this piece's bullets by sub-section
        const groups = [];
        piece.forEach((b) => {
          const last = groups[groups.length - 1];
          if (last && last.secIdx === b.secIdx) last.bullets.push(b);
          else groups.push({ secIdx: b.secIdx, sec: b.sec, bullets: [b] });
        });

        blocks.push(
          <div
            key={`exp-${expIdx}-${pieceIdx}`}
            className={`${isFirst ? 'cv-section' : 'cv-job-entry'}${flush(!isHeadPiece, !isLastPiece)}`}
          >
            {isFirst && isHeadPiece && <SectionHeader title={data.experienceTitle ?? 'PROFESSIONAL EXPERIENCE'} />}
            <div className={`cv-job-entry${expIdx > 0 ? ' cv-job-entry-second' : ''}${flush(!isHeadPiece, !isLastPiece)}`}>
              {isHeadPiece && (
                <div className="cv-job-header">
                  <div className="cv-job-title-line" style={titleFontStyle}>
                    <span className="cv-job-role">{exp.jobTitle}</span>
                    <span className="cv-job-dates">{exp.dateRange}</span>
                  </div>
                  <div className="cv-job-company">{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div>
                </div>
              )}
              {groups.map(({ secIdx, sec, bullets: secBullets }, gIdx) => {
                const startsSec = secBullets[0].firstInSec;
                const endsSec = secBullets[secBullets.length - 1].lastInSec;
                // Sub-sections inside one job normally collapse their shared margin;
                // across pieces the previous piece keeps its bottom margin instead
                const flushTop = !isHeadPiece && gIdx === 0 && startsSec;
                return (
                  <div
                    key={secIdx}
                    className={`cv-exp-subgroup${!sec.heading ? ' no-heading' : ''}${!startsSec ? ' cv-bullet-cont' : ''}${flush(flushTop, !endsSec)}`}
                  >
                    {startsSec && sec.heading && <h4 className="cv-subgroup-heading">{sec.heading}</h4>}
                    <ul className="cv-bullets-list">
                      {secBullets.map(({ item, itIdx }) => (
                        <li key={itIdx} className="cv-bullet-item">
                          <span className="cv-bullet">•</span>
                          <div className="cv-bullet-content">
                            {item.label && (
                              <strong className="cv-item-label">{item.label}:{' '}</strong>
                            )}
                            <span className="cv-item-text">{item.text}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );
      });
    });

    if (education) {
      blocks.push(
        <section key="education" className="cv-section cv-education-section">
          <SectionHeader title={education.title} />
          <div className="cv-edu-block">
            <div className="cv-edu-degree">{education.degree}</div>
            <div className="cv-edu-institution">{education.institution}</div>
            {education.highlights && education.highlights.length > 0 && (
              <ul className="cv-bullets-list">
                {education.highlights.map((item, i) => (
                  <li key={i} className="cv-bullet-item">
                    <span className="cv-bullet">•</span>
                    <div className="cv-bullet-content">
                      <span className="cv-item-text">{item}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      );
    }

    if (languages) {
      blocks.push(
        <section key="languages" className="cv-section cv-languages-section">
          <SectionHeader title={languages.title} />
          <div className="cv-languages-row">
            {languages.items.map((lang, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <span className="cv-lang-pipe">|</span>}
                <div className="cv-language-badge">
                  <span className="cv-lang-name">{lang.name}</span>
                  <span className="cv-lang-sep">-</span>
                  <span className="cv-lang-level">{lang.level}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>
      );
    }

    if (data.declaration) {
      blocks.push(
        <section key="declaration" className="cv-section cv-declaration-section">
          <SectionHeader title={data.declaration.title || "DECLARATION"} />
          <div className="cv-declaration-content">
            <p className="cv-declaration-text">{data.declaration.text}</p>
            {data.declaration.signature && (
              <div className="cv-declaration-signature" style={titleFontStyle}>
                {data.declaration.signature}
              </div>
            )}
          </div>
        </section>
      );
    }

    return blocks;
  };

  const blocks = buildBlocks();

  useLayoutEffect(() => {
    const hEl = headerMeasureRef.current;
    const bEl = bodyMeasureRef.current;
    if (!hEl || !bEl) return;

    const headerH = hEl.getBoundingClientRect().height;
    const bStyle  = window.getComputedStyle(bEl);
    const bodyPad =
      parseFloat(bStyle.paddingTop  || 0) +
      parseFloat(bStyle.paddingBottom || 0);

    // Body is a flex column, so margins don't collapse and must be counted
    const blockHeights = Array.from(bEl.children).map(el => {
      const s = window.getComputedStyle(el);
      return el.getBoundingClientRect().height +
        parseFloat(s.marginTop || 0) + parseFloat(s.marginBottom || 0);
    });

    if (pageMode === 'single' || pageMode === '1-page') {
      const all = blockHeights.map((_, i) => i);
      setPageGroups([all]);
      return;
    }

    const page1Cap = A4_H - headerH - bodyPad;
    const pageNCap = A4_H - bodyPad;

    const groups = [];
    let page = [], used = 0, cap = page1Cap;

    blockHeights.forEach((h, i) => {
      if (page.length === 0 || used + h <= cap) {
        page.push(i);
        used += h;
      } else {
        groups.push(page);
        page  = [i];
        used  = h;
        cap   = pageNCap;
      }
    });
    if (page.length > 0) groups.push(page);

    setPageGroups(prev => {
      const nextStr = JSON.stringify(groups);
      return JSON.stringify(prev) === nextStr ? prev : groups;
    });
  });

  const numPages    = pageGroups ? pageGroups.length : 0;
  const isSinglePg  = numPages <= 1;
  const isSideBySide =
    numPages > 1 &&
    typeof window !== 'undefined' &&
    window.innerWidth > 1750;

  const layoutW = isSideBySide ? A4_W * 2 + 40 : A4_W;
  const layoutH = isSideBySide
    ? A4_H + PAGE_GAP
    : numPages > 0 ? numPages * A4_H + (numPages - 1) * PAGE_GAP : A4_H;

  const scaledW = Math.round(layoutW * scale);
  const scaledH = Math.round(layoutH * scale);

  const renderPageCard = (group, pageIdx) => (
    <div
      className={`cv-page density-${spacingDensity}`}
      style={{ ...fontStyle, minHeight: `${A4_H}px` }}
    >
      {pageIdx === 0 && <HeaderBanner />}
      <div className="cv-body-content">
        {group.map(bIdx => blocks[bIdx])}
      </div>
    </div>
  );

  return (
    <>
      <div
        aria-hidden="true"
        className="cv-measure-container"
        style={{
          position     : 'fixed',
          top          : '-99999px',
          left         : 0,
          width        : `${A4_W}px`,
          visibility   : 'hidden',
          pointerEvents: 'none',
          zIndex       : -1
        }}
      >
        <div className={`cv-page density-${spacingDensity}`} style={fontStyle}>
          <div ref={headerMeasureRef}>
            <HeaderBanner />
          </div>
          <div ref={bodyMeasureRef} className="cv-body-content">
            {blocks}
          </div>
        </div>
      </div>

      <div
        className="cv-scale-container"
        style={{
          width   : `${scaledW}px`,
          minWidth: `${scaledW}px`,
          maxWidth: `${scaledW}px`,
          height  : `${scaledH}px`,
          position: 'relative',
          margin  : '0 auto'
        }}
      >
        <div
          className="cv-render-wrapper"
          style={{
            width          : `${layoutW}px`,
            transform      : `scale(${scale})`,
            transformOrigin: 'top left',
            position       : 'absolute',
            top            : 0,
            left           : 0
          }}
        >
          {pageGroups && (
            <div
              className={`cv-pages-container ${
                isSinglePg
                  ? 'single-page'
                  : isSideBySide
                    ? 'two-page-grid side-by-side'
                    : 'two-page-grid'
              }`}
            >
              {pageGroups.map((group, pageIdx) => (
                <div key={pageIdx} className="cv-page-wrapper">
                  <div className="cv-page-label">
                    Page {pageIdx + 1} of {numPages}
                    {numPages === 1 ? ' (Executive Fit)' : ''}
                  </div>
                  {renderPageCard(group, pageIdx)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="cv-print-only-container">
        {pageGroups && pageGroups.map((group, pageIdx) => (
          <React.Fragment key={pageIdx}>
            {pageIdx > 0 && <div className="cv-page-break-print" />}
            {renderPageCard(group, pageIdx)}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

export default memo(ResumePreview);
