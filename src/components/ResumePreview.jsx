import React from 'react';

export default function ResumePreview({
  data,
  pageMode = 'auto', // 'auto' | '1-page' | '2-page' | 'page-1' | 'page-2'
  scale = 1,
  spacingDensity = 'normal',
  fontFamily = 'playfair'
}) {
  const { header, theme, summary, skills, experiences, education, languages } = data;

  // Decide if single page or two page
  const exp1 = experiences[0] || null;
  const isSinglePage =
    pageMode === '1-page' ||
    (pageMode === 'auto' &&
      experiences.length <= 1 &&
      (!exp1 || exp1.sections.length <= 3));

  const getBodyFont = () => {
    if (fontFamily === 'inter') return "'Inter', -apple-system, sans-serif";
    if (fontFamily === 'lora') return "'Lora', Georgia, serif";
    return "'Lora', 'Merriweather', 'Times New Roman', serif";
  };

  const getTitleFont = () => {
    if (fontFamily === 'inter') return "'Inter', sans-serif";
    if (fontFamily === 'lora') return "'Lora', 'Playfair Display', serif";
    return "'Cinzel', 'Playfair Display', 'Times New Roman', serif";
  };

  const fontStyle = {
    fontFamily: getBodyFont()
  };

  const titleFontStyle = {
    fontFamily: getTitleFont()
  };

  // Section Header Component with double horizontal rule
  const SectionHeader = ({ title }) => (
    <div className="cv-section-header-wrap">
      <div
        className="cv-section-divider-top"
        style={{ borderColor: theme.borderColor || '#000000' }}
      />
      <h2
        className="cv-section-title"
        style={{
          ...titleFontStyle,
          color: theme.headingColor || '#000000',
          borderColor: theme.borderColor || '#000000'
        }}
      >
        {title}
      </h2>
      <div
        className="cv-section-divider-bottom"
        style={{ borderColor: theme.borderColor || '#000000' }}
      />
    </div>
  );

  // Render Header Banner
  const renderHeaderBanner = () => (
    <div
      className="cv-header-banner"
      style={{
        backgroundColor: theme.bannerColor,
        color: theme.bannerTextColor
      }}
    >
      <div className="cv-header-left">
        <h1 className="cv-name" style={titleFontStyle}>
          {header.fullName}
        </h1>
        <div
          className="cv-job-title"
          style={{
            color: theme.bannerSubColor || '#d2e7ec',
            ...titleFontStyle
          }}
        >
          {header.jobTitle}
        </div>

        <ul className="cv-contact-list">
          {header.contacts.map((c, i) => (
            <li key={i} className="cv-contact-item">
              <span className="cv-contact-bullet">•</span>
              <span className="cv-contact-label">{c.label} :</span>
              {c.link ? (
                <a
                  href={c.link}
                  className={`cv-contact-value ${c.label.toLowerCase().includes('mail') ? 'cv-contact-link' : ''
                    }`}
                  style={{ color: theme.bannerTextColor }}
                  target="_blank"
                  rel="noreferrer"
                >
                  {c.value}
                </a>
              ) : (
                <span className="cv-contact-value">{c.value}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {header.showPhoto && header.photoUrl && (
        <div className="cv-header-right">
          <div className="cv-photo-frame">
            <img
              src={header.photoUrl}
              alt={header.fullName}
              className="cv-photo-img"
            />
          </div>
        </div>
      )}
    </div>
  );

  // Experience 1 split for multi-page mode (as in Asrif's original PDF)
  const exp1Page1Sections = exp1 ? exp1.sections.slice(0, 5) : [];
  const exp1Page2Sections = exp1 ? exp1.sections.slice(5) : [];
  const exp2 = experiences[1] || null;
  const remainingExperiences = experiences.slice(2);

  // ==========================================
  // SINGLE PAGE COMPLETE RENDER
  // ==========================================
  const renderSinglePage = () => (
    <div className={`cv-page cv-single-fit density-${spacingDensity}`} style={fontStyle}>
      {renderHeaderBanner()}

      <div className="cv-body-content">
        {/* Professional Summary */}
        <section className="cv-section">
          <SectionHeader title={summary.title} />
          <p className="cv-summary-text">{summary.content}</p>
        </section>

        {/* Skills & Knowledge */}
        <section className="cv-section">
          <SectionHeader title={skills.title} />
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
        </section>

        {/* Professional Experience */}
        {experiences.length > 0 && (
          <section className="cv-section">
            <SectionHeader title="PROFESSIONAL EXPERIENCE" />
            {experiences.map((exp, expIdx) => (
              <div key={expIdx} className="cv-job-entry">
                <div className="cv-job-header">
                  <div className="cv-job-title-line" style={titleFontStyle}>
                    <span className="cv-job-role">{exp.jobTitle}</span>
                    <span className="cv-job-dates">{exp.dateRange}</span>
                  </div>
                  <div className="cv-job-company">
                    {exp.company} | {exp.location}.
                  </div>
                </div>

                {exp.sections.map((sec, secIdx) => (
                  <div key={secIdx} className="cv-exp-subgroup">
                    {sec.heading && (
                      <h4 className="cv-subgroup-heading">{sec.heading}</h4>
                    )}
                    <ul className="cv-bullets-list">
                      {sec.items.map((item, itIdx) => (
                        <li key={itIdx} className="cv-bullet-item">
                          <span className="cv-bullet">•</span>
                          <div className="cv-bullet-content">
                            {item.label && (
                              <strong className="cv-item-label">
                                {item.label}:{' '}
                              </strong>
                            )}
                            <span className="cv-item-text">{item.text}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}

        {/* Education / Technical Training */}
        {education && (
          <section className="cv-section cv-education-section">
            <SectionHeader title={education.title} />
            <div className="cv-edu-block">
              <div className="cv-edu-degree">{education.degree}</div>
              <div className="cv-edu-institution">{education.institution}</div>
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
            </div>
          </section>
        )}

        {/* Languages */}
        {languages && (
          <section className="cv-section cv-languages-section">
            <SectionHeader title={languages.title} />
            <div className="cv-languages-row">
              {languages.items.map((lang, lIdx) => (
                <div key={lIdx} className="cv-language-badge">
                  <span className="cv-lang-name">{lang.name}</span>
                  <span className="cv-lang-sep">-</span>
                  <span className="cv-lang-level">{lang.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  // ==========================================
  // PAGE 1 OF 2
  // ==========================================
  const renderPage1 = () => (
    <div className={`cv-page cv-page-1 density-${spacingDensity}`} style={fontStyle}>
      {renderHeaderBanner()}

      <div className="cv-body-content">
        <section className="cv-section">
          <SectionHeader title={summary.title} />
          <p className="cv-summary-text">{summary.content}</p>
        </section>

        <section className="cv-section">
          <SectionHeader title={skills.title} />
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
        </section>

        {exp1 && (
          <section className="cv-section">
            <SectionHeader title="PROFESSIONAL EXPERIENCE" />
            <div className="cv-job-entry">
              <div className="cv-job-header">
                <div className="cv-job-title-line" style={titleFontStyle}>
                  <span className="cv-job-role">{exp1.jobTitle}</span>
                  <span className="cv-job-dates">{exp1.dateRange}</span>
                </div>
                <div className="cv-job-company">
                  {exp1.company} | {exp1.location}.
                </div>
              </div>

              {exp1Page1Sections.map((sec, secIdx) => (
                <div key={secIdx} className="cv-exp-subgroup">
                  {sec.heading && (
                    <h4 className="cv-subgroup-heading">{sec.heading}</h4>
                  )}
                  <ul className="cv-bullets-list">
                    {sec.items.map((item, itIdx) => (
                      <li key={itIdx} className="cv-bullet-item">
                        <span className="cv-bullet">•</span>
                        <div className="cv-bullet-content">
                          {item.label && (
                            <strong className="cv-item-label">
                              {item.label}:{' '}
                            </strong>
                          )}
                          <span className="cv-item-text">{item.text}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  // ==========================================
  // PAGE 2 OF 2
  // ==========================================
  const renderPage2 = () => (
    <div className={`cv-page cv-page-2 density-${spacingDensity}`} style={fontStyle}>
      <div className="cv-body-content cv-page-2-body">
        {exp1 && exp1Page2Sections.length > 0 && (
          <div className="cv-job-continuation">
            {exp1Page2Sections.map((sec, secIdx) => (
              <div key={secIdx} className="cv-exp-subgroup">
                {sec.heading && (
                  <h4 className="cv-subgroup-heading">{sec.heading}</h4>
                )}
                <ul className="cv-bullets-list">
                  {sec.items.map((item, itIdx) => (
                    <li key={itIdx} className="cv-bullet-item">
                      <span className="cv-bullet">•</span>
                      <div className="cv-bullet-content">
                        {item.label && (
                          <strong className="cv-item-label">
                            {item.label}:{' '}
                          </strong>
                        )}
                        <span className="cv-item-text">{item.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {exp2 && (
          <div className="cv-job-entry cv-job-entry-second">
            <div className="cv-job-header">
              <div className="cv-job-title-line" style={titleFontStyle}>
                <span className="cv-job-role">{exp2.jobTitle}</span>
                <span className="cv-job-dates">{exp2.dateRange}</span>
              </div>
              <div className="cv-job-company">
                {exp2.company} | {exp2.location}.
              </div>
            </div>

            {exp2.sections.map((sec, secIdx) => (
              <div key={secIdx} className="cv-exp-subgroup">
                {sec.heading && (
                  <h4 className="cv-subgroup-heading">{sec.heading}</h4>
                )}
                <ul className="cv-bullets-list">
                  {sec.items.map((item, itIdx) => (
                    <li key={itIdx} className="cv-bullet-item">
                      <span className="cv-bullet">•</span>
                      <div className="cv-bullet-content">
                        {item.label && (
                          <strong className="cv-item-label">
                            {item.label}:{' '}
                          </strong>
                        )}
                        <span className="cv-item-text">{item.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {remainingExperiences.map((exp, rIdx) => (
          <div key={rIdx} className="cv-job-entry">
            <div className="cv-job-header">
              <div className="cv-job-title-line" style={titleFontStyle}>
                <span className="cv-job-role">{exp.jobTitle}</span>
                <span className="cv-job-dates">{exp.dateRange}</span>
              </div>
              <div className="cv-job-company">
                {exp.company} | {exp.location}.
              </div>
            </div>
            {exp.sections.map((sec, secIdx) => (
              <div key={secIdx} className="cv-exp-subgroup">
                {sec.heading && (
                  <h4 className="cv-subgroup-heading">{sec.heading}</h4>
                )}
                <ul className="cv-bullets-list">
                  {sec.items.map((item, itIdx) => (
                    <li key={itIdx} className="cv-bullet-item">
                      <span className="cv-bullet">•</span>
                      <div className="cv-bullet-content">
                        {item.label && (
                          <strong className="cv-item-label">
                            {item.label}:{' '}
                          </strong>
                        )}
                        <span className="cv-item-text">{item.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}

        <section className="cv-section cv-education-section">
          <SectionHeader title={education.title} />
          <div className="cv-edu-block">
            <div className="cv-edu-degree">{education.degree}</div>
            <div className="cv-edu-institution">{education.institution}</div>
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
          </div>
        </section>

        <section className="cv-section cv-languages-section">
          <SectionHeader title={languages.title} />
          <div className="cv-languages-row">
            {languages.items.map((lang, lIdx) => (
              <div key={lIdx} className="cv-language-badge">
                <span className="cv-lang-name">{lang.name}</span>
                <span className="cv-lang-sep">-</span>
                <span className="cv-lang-level">{lang.level}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div
      className="cv-render-wrapper"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
    >
      {/* Visual Canvas Display */}
      {isSinglePage ? (
        <div className="cv-pages-container single-page">
          <div className="cv-page-wrapper">
            <div className="cv-page-label">Page 1 of 1 (Executive Fit)</div>
            {renderSinglePage()}
          </div>
        </div>
      ) : (
        <div className="cv-pages-container two-page-grid">
          <div className="cv-page-wrapper">
            <div className="cv-page-label">Page 1 of 2</div>
            {renderPage1()}
          </div>
          <div className="cv-page-wrapper">
            <div className="cv-page-label">Page 2 of 2</div>
            {renderPage2()}
          </div>
        </div>
      )}

      {/* For Print: Outputs flawless A4 sheets */}
      <div className="cv-print-only-container">
        {isSinglePage ? (
          renderSinglePage()
        ) : (
          <>
            {renderPage1()}
            <div className="cv-page-break-print" />
            {renderPage2()}
          </>
        )}
      </div>
    </div>
  );
}
