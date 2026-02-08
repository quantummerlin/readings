// ============================================
// A MOMENT IN TIME — A5 PAPERBACK BOOK PDF EXPORT
// ============================================
// Creates beautiful, book-quality PDFs formatted
// perfectly for A5 paperback printing (148mm × 210mm)
// ============================================

const PDF_BOOK = {
    // A5 dimensions in mm
    pageWidth: 148,
    pageHeight: 210,
    // Book margins (mm) — gutter on inside for binding
    margin: { top: 18, bottom: 22, outside: 14, inside: 18 },
    // Computed content area
    get contentWidth() { return this.pageWidth - this.margin.outside - this.margin.inside; },
    get contentHeight() { return this.pageHeight - this.margin.top - this.margin.bottom; },
    
    // Color palette
    colors: {
        cosmic: '#2d1b4e',
        gold: '#b8860b',
        goldLight: '#d4a843',
        accent: '#6b4c8a',
        text: '#1a1a2e',
        textLight: '#4a4a6a',
        divider: '#d4c5a9',
        pageBg: '#fefcf8',
        cream: '#f9f5ee',
        sectionBg: '#f3efe6',
    }
};

// ============================================
// MAIN EXPORT FUNCTION
// ============================================

async function exportPDFBook() {
    // Gather data
    const userData = window.lastUserData || JSON.parse(localStorage.getItem('lastReading') || '{}');
    const readings = window.lastGeneratedReadings;
    
    if (!userData.name || !readings) {
        alert('Please generate a reading first before exporting as PDF.');
        return;
    }

    // Show loading overlay
    const overlay = showPDFLoadingOverlay();
    
    try {
        // Build the A5 book HTML
        const bookHTML = buildBookHTML(userData, readings);
        
        // Create a hidden container for rendering
        const container = document.createElement('div');
        container.id = 'pdf-render-container';
        container.style.cssText = 'position:fixed; left:-9999px; top:0; z-index:-1;';
        container.innerHTML = bookHTML;
        document.body.appendChild(container);
        
        // Wait for fonts and images to load
        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 500));
        
        const element = container.querySelector('.a5-book');
        
        // Configure html2pdf
        const opt = {
            margin: 0,
            filename: `${userData.name.replace(/[^a-zA-Z0-9]/g, '-')}-Moment-in-Time-Book.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                logging: false,
                backgroundColor: PDF_BOOK.colors.pageBg
            },
            jsPDF: {
                unit: 'mm',
                format: [PDF_BOOK.pageWidth, PDF_BOOK.pageHeight],
                orientation: 'portrait',
                compress: true
            },
            pagebreak: {
                mode: ['css', 'legacy'],
                before: '.pdf-page-break-before',
                after: '.pdf-page-break-after',
                avoid: '.pdf-no-break'
            }
        };
        
        // Generate PDF
        await html2pdf().set(opt).from(element).save();
        
        // Cleanup
        document.body.removeChild(container);
        
        // Show success
        showPDFSuccessMessage(userData.name);
        
    } catch (error) {
        console.error('PDF Export Error:', error);
        alert('There was an error creating the PDF. Please try again.');
    } finally {
        overlay.remove();
    }
}

// ============================================
// LOADING OVERLAY
// ============================================

function showPDFLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'pdf-loading-overlay';
    overlay.innerHTML = `
        <div class="pdf-loading-content">
            <div class="pdf-loading-spinner"></div>
            <h3>Creating Your Book...</h3>
            <p>Typesetting your cosmic story for A5 paperback format</p>
            <div class="pdf-loading-steps">
                <span class="step active">Composing cover</span>
                <span class="step">Setting chapters</span>
                <span class="step">Rendering pages</span>
            </div>
        </div>
    `;
    overlay.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(26, 10, 46, 0.92);
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(8px);
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .pdf-loading-content { text-align: center; color: #e8d5ff; }
        .pdf-loading-content h3 { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #ffd700; margin: 20px 0 8px; }
        .pdf-loading-content p { font-size: 0.95rem; opacity: 0.8; margin-bottom: 20px; }
        .pdf-loading-spinner {
            width: 60px; height: 60px; margin: 0 auto;
            border: 3px solid rgba(255,215,0,0.2);
            border-top: 3px solid #ffd700;
            border-radius: 50%;
            animation: pdfSpin 1s linear infinite;
        }
        .pdf-loading-steps { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .pdf-loading-steps .step {
            font-size: 0.8rem; padding: 4px 12px; border-radius: 12px;
            background: rgba(255,255,255,0.08); opacity: 0.5; transition: all 0.3s;
        }
        .pdf-loading-steps .step.active { opacity: 1; background: rgba(255,215,0,0.2); color: #ffd700; }
        @keyframes pdfSpin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    // Animate steps
    const steps = overlay.querySelectorAll('.step');
    setTimeout(() => { steps[0].classList.remove('active'); steps[1].classList.add('active'); }, 1500);
    setTimeout(() => { steps[1].classList.remove('active'); steps[2].classList.add('active'); }, 3000);
    
    return overlay;
}

function showPDFSuccessMessage(name) {
    const toast = document.createElement('div');
    toast.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:1.8rem;">📖</span>
            <div>
                <strong style="color:#ffd700;">PDF Book Created!</strong><br>
                <span style="font-size:0.85rem;opacity:0.8;">${name}'s A5 paperback is ready</span>
            </div>
        </div>
    `;
    toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: linear-gradient(135deg, #2d1b4e, #1a0a2e);
        color: #e8d5ff; padding: 16px 28px; border-radius: 16px;
        border: 1px solid rgba(255,215,0,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        z-index: 99999; animation: pdfToastIn 0.4s ease;
        font-family: 'Inter', sans-serif;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pdfToastIn { from { opacity:0; transform: translateX(-50%) translateY(20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 500); }, 4000);
}

// ============================================
// BUILD COMPLETE A5 BOOK HTML
// ============================================

function buildBookHTML(userData, readings) {
    const name = userData.name;
    const birthDate = new Date(userData.birthDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const birthTime = userData.birthTime || '';
    const birthPlace = userData.birthPlace || '';
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Extract all reading data
    const astro = readings.astrology;
    const numr = readings.numerology;
    
    // Collect all reading sections from the DOM
    const readingSections = collectReadingSections();
    
    return `
    <div class="a5-book">
        ${buildBookStyles()}
        
        <!-- HALF TITLE PAGE -->
        ${buildHalfTitlePage(name)}
        
        <!-- FULL TITLE PAGE / COVER -->
        ${buildTitlePage(name, birthDate, birthTime, birthPlace, today)}
        
        <!-- DEDICATION / EPIGRAPH -->
        ${buildEpigraphPage(name)}
        
        <!-- COSMIC SNAPSHOT -->
        ${buildCosmicSnapshotPage(name, astro, numr)}
        
        <!-- TABLE OF CONTENTS -->
        ${buildTOCPage(readingSections)}
        
        <!-- READING CHAPTERS -->
        ${buildAllChapters(readingSections, name)}
        
        <!-- CLOSING PAGE -->
        ${buildClosingPage(name, astro, numr)}
        
        <!-- COLOPHON / BACK PAGE -->
        ${buildColophonPage(name, today)}
    </div>
    `;
}

// ============================================
// COLLECT READING SECTIONS FROM DOM
// ============================================

function collectReadingSections() {
    const sections = [];
    const domSections = document.querySelectorAll('#readingsContainer .reading-section');
    
    domSections.forEach((section, sIdx) => {
        const header = section.querySelector('.section-header');
        const sectionName = header ? (header.querySelector('h2')?.textContent || header.querySelector('h3')?.textContent || `Section ${sIdx + 1}`) : `Section ${sIdx + 1}`;
        const sectionIcon = header ? (header.querySelector('.section-icon')?.textContent || '') : '';
        const sectionDesc = header ? (header.querySelector('.section-description')?.textContent || header.querySelector('p')?.textContent || '') : '';
        
        const cards = [];
        section.querySelectorAll('.reading-card').forEach(card => {
            const title = card.querySelector('h3')?.textContent || '';
            const resultValue = card.querySelector('.result-value')?.textContent || '';
            const icon = card.querySelector('.card-icon')?.textContent || '';
            
            // Get the content from the expanded body
            const body = card.querySelector('.reading-card-body') || card.querySelector('.reading-content');
            let content = '';
            if (body) {
                // Clone and clean
                const clone = body.cloneNode(true);
                clone.querySelectorAll('.mark-read-btn, .read-badge, .expand-icon, button, .keyword-tag, script').forEach(el => el.remove());
                content = clone.innerHTML;
            }
            
            // Also grab keywords if present
            const keywords = [];
            card.querySelectorAll('.keyword-tag').forEach(kw => {
                keywords.push(kw.textContent.trim());
            });
            
            // Strengths and challenges
            let strengths = [];
            let challenges = [];
            card.querySelectorAll('.strengths li, .strength-item').forEach(li => strengths.push(li.textContent.trim()));
            card.querySelectorAll('.challenges li, .challenge-item').forEach(li => challenges.push(li.textContent.trim()));
            
            if (title) {
                cards.push({ title, resultValue, icon, content, keywords, strengths, challenges });
            }
        });
        
        // Also collect sub-sections
        section.querySelectorAll('.sub-section').forEach(sub => {
            const subHeader = sub.querySelector('.sub-section-header');
            const subTitle = subHeader ? (subHeader.querySelector('h4')?.textContent || subHeader.querySelector('h3')?.textContent || '') : '';
            const subBody = sub.querySelector('.sub-section-body');
            
            if (subBody && subTitle) {
                let subContent = '';
                const clone = subBody.cloneNode(true);
                clone.querySelectorAll('button, script').forEach(el => el.remove());
                subContent = clone.innerHTML;
                
                cards.push({ title: subTitle, resultValue: '', icon: '', content: subContent, keywords: [], strengths: [], challenges: [] });
            }
        });
        
        if (cards.length > 0 || sectionName) {
            sections.push({ name: sectionName.trim(), icon: sectionIcon.trim(), description: sectionDesc.trim(), cards });
        }
    });
    
    return sections;
}

// ============================================
// BOOK STYLESHEET
// ============================================

function buildBookStyles() {
    return `<style>
    /* ========================================= */
    /* A5 PAPERBACK BOOK STYLES                 */
    /* 148mm × 210mm with book-quality typography */
    /* ========================================= */
    
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
    
    .a5-book {
        width: 148mm;
        background: ${PDF_BOOK.colors.pageBg};
        color: ${PDF_BOOK.colors.text};
        font-family: 'EB Garamond', 'Cormorant Garamond', 'Georgia', serif;
        font-size: 10pt;
        line-height: 1.65;
        -webkit-font-smoothing: antialiased;
    }
    
    /* ---- Page structure ---- */
    .book-page {
        width: 148mm;
        min-height: 210mm;
        padding: ${PDF_BOOK.margin.top}mm ${PDF_BOOK.margin.outside}mm ${PDF_BOOK.margin.bottom}mm ${PDF_BOOK.margin.inside}mm;
        position: relative;
        box-sizing: border-box;
        overflow: hidden;
    }
    
    .book-page.verso {
        padding-left: ${PDF_BOOK.margin.outside}mm;
        padding-right: ${PDF_BOOK.margin.inside}mm;
    }
    
    /* Page breaks */
    .pdf-page-break-before {
        page-break-before: always;
        break-before: page;
    }
    
    .pdf-no-break {
        page-break-inside: avoid;
        break-inside: avoid;
    }
    
    /* ---- COVER / TITLE PAGE ---- */
    .book-cover {
        width: 148mm;
        min-height: 210mm;
        background: linear-gradient(170deg, #1a0a2e 0%, #2d1b4e 30%, #1a0a2e 60%, #0f0720 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 25mm 18mm;
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
    }
    
    .cover-stars {
        position: absolute;
        inset: 0;
        background-image: 
            radial-gradient(1px 1px at 20% 15%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 80% 25%, rgba(255,215,0,0.5), transparent),
            radial-gradient(1.5px 1.5px at 50% 10%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 10% 60%, rgba(255,215,0,0.4), transparent),
            radial-gradient(1px 1px at 90% 70%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1.5px 1.5px at 30% 80%, rgba(255,215,0,0.4), transparent),
            radial-gradient(1px 1px at 70% 50%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 45% 35%, rgba(255,215,0,0.3), transparent),
            radial-gradient(1.5px 1.5px at 15% 45%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 85% 85%, rgba(255,215,0,0.5), transparent),
            radial-gradient(1px 1px at 60% 90%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1.5px 1.5px at 40% 55%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 25% 95%, rgba(255,215,0,0.3), transparent),
            radial-gradient(1px 1px at 75% 5%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 55% 65%, rgba(255,215,0,0.3), transparent);
    }
    
    .cover-border {
        position: absolute;
        inset: 8mm;
        border: 0.5pt solid rgba(255,215,0,0.25);
        border-radius: 2pt;
        pointer-events: none;
    }
    
    .cover-border-inner {
        position: absolute;
        inset: 10mm;
        border: 0.25pt solid rgba(255,215,0,0.15);
        border-radius: 1pt;
        pointer-events: none;
    }
    
    .cover-ornament-top, .cover-ornament-bottom {
        position: relative;
        z-index: 1;
        color: rgba(255,215,0,0.6);
        font-size: 14pt;
        letter-spacing: 6pt;
        margin: 8mm 0;
    }
    
    .cover-title {
        position: relative;
        z-index: 1;
        font-family: 'Cormorant Garamond', serif;
        font-size: 22pt;
        font-weight: 300;
        color: #ffd700;
        letter-spacing: 2pt;
        text-transform: uppercase;
        margin-bottom: 3mm;
        line-height: 1.2;
        text-shadow: 0 0 30px rgba(255,215,0,0.3);
    }
    
    .cover-subtitle {
        position: relative;
        z-index: 1;
        font-family: 'EB Garamond', serif;
        font-style: italic;
        font-size: 11pt;
        color: rgba(200, 180, 255, 0.8);
        margin-bottom: 10mm;
        letter-spacing: 1pt;
    }
    
    .cover-name {
        position: relative;
        z-index: 1;
        font-family: 'Cormorant Garamond', serif;
        font-size: 18pt;
        font-weight: 600;
        color: #ffffff;
        letter-spacing: 1.5pt;
        margin-bottom: 8mm;
        text-shadow: 0 0 20px rgba(255,255,255,0.2);
    }
    
    .cover-birth-details {
        position: relative;
        z-index: 1;
        font-family: 'EB Garamond', serif;
        font-size: 9pt;
        color: rgba(200, 180, 255, 0.6);
        line-height: 1.8;
        letter-spacing: 0.5pt;
    }
    
    .cover-brand {
        position: absolute;
        bottom: 14mm;
        left: 0;
        right: 0;
        text-align: center;
        z-index: 1;
        font-family: 'Cormorant Garamond', serif;
        font-size: 7.5pt;
        color: rgba(255,215,0,0.4);
        letter-spacing: 3pt;
        text-transform: uppercase;
    }
    
    /* ---- HALF TITLE ---- */
    .half-title-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
    
    .half-title-text {
        font-family: 'Cormorant Garamond', serif;
        font-size: 16pt;
        font-weight: 300;
        color: ${PDF_BOOK.colors.cosmic};
        letter-spacing: 2pt;
        text-transform: uppercase;
    }
    
    .half-title-name {
        font-family: 'Cormorant Garamond', serif;
        font-size: 13pt;
        font-weight: 400;
        color: ${PDF_BOOK.colors.accent};
        margin-top: 4mm;
        font-style: italic;
    }
    
    /* ---- EPIGRAPH PAGE ---- */
    .epigraph-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
    
    .epigraph-text {
        font-family: 'EB Garamond', serif;
        font-style: italic;
        font-size: 11pt;
        color: ${PDF_BOOK.colors.textLight};
        max-width: 85mm;
        line-height: 1.8;
        margin-bottom: 6mm;
    }
    
    .epigraph-attribution {
        font-family: 'Cormorant Garamond', serif;
        font-size: 9pt;
        color: ${PDF_BOOK.colors.accent};
        letter-spacing: 1pt;
    }
    
    .epigraph-dedication {
        font-family: 'EB Garamond', serif;
        font-size: 10pt;
        color: ${PDF_BOOK.colors.textLight};
        margin-top: 15mm;
        font-style: italic;
        line-height: 1.7;
    }
    
    /* ---- COSMIC SNAPSHOT PAGE ---- */
    .snapshot-page {
        background: linear-gradient(180deg, ${PDF_BOOK.colors.pageBg} 0%, ${PDF_BOOK.colors.cream} 100%);
    }
    
    .snapshot-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 14pt;
        font-weight: 600;
        color: ${PDF_BOOK.colors.cosmic};
        text-align: center;
        letter-spacing: 2pt;
        text-transform: uppercase;
        margin-bottom: 6mm;
    }
    
    .snapshot-divider {
        width: 30mm;
        height: 0.5pt;
        background: ${PDF_BOOK.colors.gold};
        margin: 0 auto 6mm;
    }
    
    .snapshot-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3mm;
        margin-bottom: 5mm;
    }
    
    .snapshot-category {
        margin-bottom: 4mm;
    }
    
    .snapshot-category-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 9pt;
        font-weight: 600;
        color: ${PDF_BOOK.colors.gold};
        text-transform: uppercase;
        letter-spacing: 1.5pt;
        margin-bottom: 2mm;
        padding-bottom: 1mm;
        border-bottom: 0.25pt solid ${PDF_BOOK.colors.divider};
    }
    
    .snapshot-item {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        font-size: 8.5pt;
        padding: 0.8mm 0;
        line-height: 1.4;
    }
    
    .snapshot-planet {
        color: ${PDF_BOOK.colors.textLight};
        font-weight: 500;
    }
    
    .snapshot-sign {
        color: ${PDF_BOOK.colors.cosmic};
        font-weight: 600;
        font-family: 'Cormorant Garamond', serif;
    }
    
    .snapshot-full-width {
        grid-column: 1 / -1;
    }
    
    /* ---- TABLE OF CONTENTS ---- */
    .toc-page-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 14pt;
        font-weight: 600;
        color: ${PDF_BOOK.colors.cosmic};
        text-align: center;
        letter-spacing: 2pt;
        text-transform: uppercase;
        margin-bottom: 3mm;
    }
    
    .toc-divider {
        width: 30mm;
        height: 0.5pt;
        background: ${PDF_BOOK.colors.gold};
        margin: 0 auto 6mm;
    }
    
    .toc-section {
        margin-bottom: 4mm;
    }
    
    .toc-section-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 10.5pt;
        font-weight: 600;
        color: ${PDF_BOOK.colors.cosmic};
        margin-bottom: 1.5mm;
        padding-bottom: 1mm;
        border-bottom: 0.25pt solid ${PDF_BOOK.colors.divider};
    }
    
    .toc-item {
        font-size: 8.5pt;
        color: ${PDF_BOOK.colors.textLight};
        padding: 0.5mm 0 0.5mm 3mm;
        line-height: 1.5;
    }
    
    .toc-item-value {
        color: ${PDF_BOOK.colors.accent};
        font-style: italic;
        margin-left: 2mm;
    }
    
    /* ---- CHAPTER TITLE PAGES ---- */
    .chapter-title-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: linear-gradient(180deg, ${PDF_BOOK.colors.pageBg} 0%, ${PDF_BOOK.colors.cream} 50%, ${PDF_BOOK.colors.pageBg} 100%);
    }
    
    .chapter-number {
        font-family: 'Cormorant Garamond', serif;
        font-size: 8pt;
        color: ${PDF_BOOK.colors.gold};
        letter-spacing: 3pt;
        text-transform: uppercase;
        margin-bottom: 4mm;
    }
    
    .chapter-icon {
        font-size: 20pt;
        margin-bottom: 4mm;
        opacity: 0.7;
    }
    
    .chapter-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 17pt;
        font-weight: 600;
        color: ${PDF_BOOK.colors.cosmic};
        letter-spacing: 1.5pt;
        margin-bottom: 3mm;
        line-height: 1.3;
    }
    
    .chapter-desc {
        font-family: 'EB Garamond', serif;
        font-style: italic;
        font-size: 9.5pt;
        color: ${PDF_BOOK.colors.textLight};
        max-width: 90mm;
        line-height: 1.6;
    }
    
    .chapter-ornament {
        color: ${PDF_BOOK.colors.divider};
        font-size: 10pt;
        letter-spacing: 4pt;
        margin-top: 6mm;
    }
    
    /* ---- READING CARDS IN BOOK FORMAT ---- */
    .book-reading {
        margin-bottom: 5mm;
        page-break-inside: avoid;
        break-inside: avoid;
    }
    
    .book-reading-header {
        display: flex;
        align-items: baseline;
        gap: 2mm;
        margin-bottom: 2mm;
        padding-bottom: 1.5mm;
        border-bottom: 0.4pt solid ${PDF_BOOK.colors.divider};
    }
    
    .book-reading-icon {
        font-size: 11pt;
        flex-shrink: 0;
    }
    
    .book-reading-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 11pt;
        font-weight: 600;
        color: ${PDF_BOOK.colors.cosmic};
        flex: 1;
    }
    
    .book-reading-value {
        font-family: 'Cormorant Garamond', serif;
        font-size: 10pt;
        font-weight: 600;
        color: ${PDF_BOOK.colors.gold};
        font-style: italic;
    }
    
    .book-reading-body {
        font-size: 9.5pt;
        line-height: 1.65;
        color: ${PDF_BOOK.colors.text};
        text-align: justify;
        hyphens: auto;
        -webkit-hyphens: auto;
    }
    
    .book-reading-body p {
        margin-bottom: 2mm;
        text-indent: 4mm;
    }
    
    .book-reading-body p:first-child {
        text-indent: 0;
    }
    
    .book-reading-body strong {
        color: ${PDF_BOOK.colors.cosmic};
        font-weight: 600;
    }
    
    .book-reading-body em {
        color: ${PDF_BOOK.colors.accent};
        font-style: italic;
    }
    
    .book-reading-body ul, .book-reading-body ol {
        margin: 2mm 0 2mm 5mm;
        padding: 0;
    }
    
    .book-reading-body li {
        margin-bottom: 1mm;
        font-size: 9pt;
        line-height: 1.5;
    }
    
    .book-keywords {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5mm;
        margin: 2mm 0;
    }
    
    .book-keyword {
        font-family: 'EB Garamond', serif;
        font-size: 7.5pt;
        padding: 0.5mm 2.5mm;
        border: 0.3pt solid ${PDF_BOOK.colors.divider};
        border-radius: 1.5mm;
        color: ${PDF_BOOK.colors.accent};
        background: ${PDF_BOOK.colors.cream};
    }
    
    .book-strengths-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3mm;
        margin: 2mm 0;
        font-size: 8.5pt;
    }
    
    .book-strengths-col h5, .book-challenges-col h5 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 8.5pt;
        font-weight: 600;
        margin-bottom: 1mm;
        text-transform: uppercase;
        letter-spacing: 0.5pt;
    }
    
    .book-strengths-col h5 { color: #2e7d32; }
    .book-challenges-col h5 { color: #c62828; }
    
    .book-strengths-col li, .book-challenges-col li {
        font-size: 8pt;
        line-height: 1.5;
        margin-bottom: 0.5mm;
        list-style: none;
        padding-left: 2mm;
    }
    
    .book-strengths-col li::before { content: '✦ '; color: #2e7d32; font-size: 6pt; }
    .book-challenges-col li::before { content: '◇ '; color: #c62828; font-size: 6pt; }
    
    /* ---- Section dividers within chapters ---- */
    .book-section-break {
        text-align: center;
        margin: 5mm 0;
        color: ${PDF_BOOK.colors.divider};
        font-size: 9pt;
        letter-spacing: 3pt;
    }
    
    /* ---- CLOSING PAGE ---- */
    .closing-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
    
    .closing-ornament {
        color: ${PDF_BOOK.colors.gold};
        font-size: 12pt;
        letter-spacing: 4pt;
        margin-bottom: 6mm;
    }
    
    .closing-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 14pt;
        font-weight: 600;
        color: ${PDF_BOOK.colors.cosmic};
        margin-bottom: 5mm;
    }
    
    .closing-body {
        font-family: 'EB Garamond', serif;
        font-size: 9.5pt;
        color: ${PDF_BOOK.colors.textLight};
        max-width: 100mm;
        line-height: 1.7;
        text-align: center;
    }
    
    .closing-body p {
        margin-bottom: 3mm;
    }
    
    .closing-quote {
        font-family: 'EB Garamond', serif;
        font-style: italic;
        font-size: 10pt;
        color: ${PDF_BOOK.colors.accent};
        margin-top: 8mm;
        line-height: 1.6;
    }
    
    .closing-attribution {
        font-size: 8.5pt;
        color: ${PDF_BOOK.colors.textLight};
        margin-top: 2mm;
    }
    
    /* ---- COLOPHON ---- */
    .colophon-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        text-align: center;
        padding-bottom: 30mm;
    }
    
    .colophon-text {
        font-size: 7.5pt;
        color: ${PDF_BOOK.colors.textLight};
        line-height: 1.8;
        max-width: 90mm;
    }
    
    .colophon-text strong {
        color: ${PDF_BOOK.colors.cosmic};
        font-weight: 600;
    }
    
    .colophon-brand {
        font-family: 'Cormorant Garamond', serif;
        font-size: 9pt;
        color: ${PDF_BOOK.colors.gold};
        letter-spacing: 2pt;
        text-transform: uppercase;
        margin-bottom: 3mm;
    }
    
    .colophon-url {
        font-size: 7pt;
        color: ${PDF_BOOK.colors.accent};
        letter-spacing: 0.5pt;
    }
    
    /* ---- Page headers & footers (decorative) ---- */
    .page-header-decor {
        position: absolute;
        top: 10mm;
        left: ${PDF_BOOK.margin.inside}mm;
        right: ${PDF_BOOK.margin.outside}mm;
        text-align: center;
        font-family: 'Cormorant Garamond', serif;
        font-size: 6.5pt;
        color: ${PDF_BOOK.colors.divider};
        letter-spacing: 2pt;
        text-transform: uppercase;
    }
    
    .page-footer-decor {
        position: absolute;
        bottom: 12mm;
        left: ${PDF_BOOK.margin.inside}mm;
        right: ${PDF_BOOK.margin.outside}mm;
        text-align: center;
        font-family: 'EB Garamond', serif;
        font-size: 7.5pt;
        color: ${PDF_BOOK.colors.divider};
    }
    
    /* ---- Hide UI artifacts from DOM scraping ---- */
    .book-reading-body .mark-read-btn,
    .book-reading-body .read-badge,
    .book-reading-body .expand-icon,
    .book-reading-body button,
    .book-reading-body .ad-container,
    .book-reading-body .keyword-tag,
    .book-reading-body .section-mark-read-btn,
    .book-reading-body .sub-section-arrow,
    .book-reading-body .reading-card-right,
    .book-reading-body .reading-card-header {
        display: none !important;
    }
    
    .book-reading-body img {
        max-width: 100%;
        height: auto;
    }
    
    .book-reading-body .strengths-challenges {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3mm;
        font-size: 8.5pt;
    }
    
    .book-reading-body h4 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 9pt;
        font-weight: 600;
        color: ${PDF_BOOK.colors.cosmic};
        margin: 2mm 0 1mm;
    }
    
    .book-reading-body h5 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 8.5pt;
        font-weight: 600;
        color: ${PDF_BOOK.colors.accent};
        margin: 1.5mm 0 1mm;
    }
    
    .book-reading-body .blueprint-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3mm;
    }
    
    .book-reading-body .blueprint-item {
        font-size: 8.5pt;
        line-height: 1.4;
        padding: 0.5mm 0;
    }
    
    .book-reading-body .blueprint-category h4 {
        font-size: 8.5pt;
        border-bottom: 0.25pt solid ${PDF_BOOK.colors.divider};
        padding-bottom: 1mm;
        margin-bottom: 1.5mm;
    }
    
    .book-reading-body .meaning {
        font-size: 7.5pt;
        color: ${PDF_BOOK.colors.textLight};
        font-style: italic;
    }

</style>`;
}

// ============================================
// PAGE BUILDERS
// ============================================

function buildHalfTitlePage(name) {
    return `
    <div class="book-page half-title-page">
        <div class="half-title-text">A Moment in Time</div>
        <div class="half-title-name">— ${escHtml(name)} —</div>
    </div>`;
}

function buildTitlePage(name, birthDate, birthTime, birthPlace, today) {
    return `
    <div class="book-cover pdf-page-break-before">
        <div class="cover-stars"></div>
        <div class="cover-border"></div>
        <div class="cover-border-inner"></div>
        
        <div class="cover-ornament-top">· · ✦ · ·</div>
        
        <div class="cover-title">A Moment<br>in Time</div>
        <div class="cover-subtitle">A Complete Cosmic Portrait</div>
        
        <div class="cover-ornament-top">— ✧ —</div>
        
        <div class="cover-name">${escHtml(name)}</div>
        
        <div class="cover-birth-details">
            ${birthDate}<br>
            ${birthTime ? birthTime + '<br>' : ''}
            ${birthPlace ? birthPlace : ''}
        </div>
        
        <div class="cover-ornament-bottom">· · ✦ · ·</div>
        
        <div class="cover-brand">Quantum Merlin</div>
    </div>`;
}

function buildEpigraphPage(name) {
    return `
    <div class="book-page epigraph-page pdf-page-break-before">
        <div class="epigraph-text">
            "The cosmos is within us. We are made of star-stuff.<br>
            We are a way for the universe to know itself."
        </div>
        <div class="epigraph-attribution">— Carl Sagan</div>
        
        <div class="epigraph-dedication">
            This reading is dedicated to <em>${escHtml(name)}</em> —<br>
            a soul whose cosmic pattern has never existed before<br>
            and will never exist again.
        </div>
    </div>`;
}

function buildCosmicSnapshotPage(name, astro, numr) {
    const risingName = astro.risingSign ? astro.risingSign.name : 'Unknown';
    const uranusName = astro.uranusSign ? astro.uranusSign.name : '—';
    const neptuneName = astro.neptuneSign ? astro.neptuneSign.name : '—';
    const plutoName = astro.plutoSign ? astro.plutoSign.name : '—';
    const northNodeName = astro.northNode ? astro.northNode.name : '—';
    const chineseZodiac = astro.chineseZodiac ? astro.chineseZodiac.animal : '—';
    const moonPhaseName = astro.moonPhase ? astro.moonPhase.name : '—';
    
    return `
    <div class="book-page snapshot-page pdf-page-break-before">
        <div class="snapshot-title">Cosmic Coordinates</div>
        <div class="snapshot-divider"></div>
        
        <div class="snapshot-grid">
            <div class="snapshot-category">
                <div class="snapshot-category-title">The Big Three</div>
                <div class="snapshot-item"><span class="snapshot-planet">☉ Sun</span><span class="snapshot-sign">${escHtml(astro.sunSign.name)}</span></div>
                <div class="snapshot-item"><span class="snapshot-planet">☽ Moon</span><span class="snapshot-sign">${escHtml(astro.moonSign.name)}</span></div>
                <div class="snapshot-item"><span class="snapshot-planet">↑ Rising</span><span class="snapshot-sign">${escHtml(risingName)}</span></div>
            </div>
            
            <div class="snapshot-category">
                <div class="snapshot-category-title">Personal Planets</div>
                <div class="snapshot-item"><span class="snapshot-planet">☿ Mercury</span><span class="snapshot-sign">${escHtml(astro.mercurySign.name)}</span></div>
                <div class="snapshot-item"><span class="snapshot-planet">♀ Venus</span><span class="snapshot-sign">${escHtml(astro.venusSign.name)}</span></div>
                <div class="snapshot-item"><span class="snapshot-planet">♂ Mars</span><span class="snapshot-sign">${escHtml(astro.marsSign.name)}</span></div>
            </div>
            
            <div class="snapshot-category">
                <div class="snapshot-category-title">Social Planets</div>
                <div class="snapshot-item"><span class="snapshot-planet">♃ Jupiter</span><span class="snapshot-sign">${escHtml(astro.jupiterSign.name)}</span></div>
                <div class="snapshot-item"><span class="snapshot-planet">♄ Saturn</span><span class="snapshot-sign">${escHtml(astro.saturnSign.name)}</span></div>
            </div>
            
            <div class="snapshot-category">
                <div class="snapshot-category-title">Outer Planets</div>
                <div class="snapshot-item"><span class="snapshot-planet">♅ Uranus</span><span class="snapshot-sign">${escHtml(uranusName)}</span></div>
                <div class="snapshot-item"><span class="snapshot-planet">♆ Neptune</span><span class="snapshot-sign">${escHtml(neptuneName)}</span></div>
                <div class="snapshot-item"><span class="snapshot-planet">♇ Pluto</span><span class="snapshot-sign">${escHtml(plutoName)}</span></div>
            </div>
            
            <div class="snapshot-category snapshot-full-width">
                <div class="snapshot-category-title">Soul & Destiny</div>
                <div class="snapshot-grid" style="gap:2mm;">
                    <div class="snapshot-item"><span class="snapshot-planet">☊ North Node</span><span class="snapshot-sign">${escHtml(northNodeName)}</span></div>
                    <div class="snapshot-item"><span class="snapshot-planet">🌙 Moon Phase</span><span class="snapshot-sign">${escHtml(moonPhaseName)}</span></div>
                    <div class="snapshot-item"><span class="snapshot-planet">🐉 Chinese Zodiac</span><span class="snapshot-sign">${escHtml(chineseZodiac)}</span></div>
                    <div class="snapshot-item"><span class="snapshot-planet">🔢 Life Path</span><span class="snapshot-sign">${numr.lifePath || '—'}</span></div>
                    <div class="snapshot-item"><span class="snapshot-planet">✨ Destiny</span><span class="snapshot-sign">${numr.destiny || '—'}</span></div>
                    <div class="snapshot-item"><span class="snapshot-planet">💜 Soul Urge</span><span class="snapshot-sign">${numr.soulUrge || '—'}</span></div>
                </div>
            </div>
        </div>
    </div>`;
}

function buildTOCPage(readingSections) {
    let tocHTML = '';
    readingSections.forEach((section, idx) => {
        tocHTML += `
        <div class="toc-section">
            <div class="toc-section-title">${section.icon} ${escHtml(section.name)}</div>
            ${section.cards.map(card => `
                <div class="toc-item">
                    ${escHtml(card.title)}${card.resultValue ? `<span class="toc-item-value">${escHtml(card.resultValue)}</span>` : ''}
                </div>
            `).join('')}
        </div>`;
    });
    
    return `
    <div class="book-page pdf-page-break-before" style="background: linear-gradient(180deg, ${PDF_BOOK.colors.pageBg} 0%, ${PDF_BOOK.colors.cream} 100%);">
        <div class="toc-page-title">Contents</div>
        <div class="toc-divider"></div>
        ${tocHTML}
    </div>`;
}

// ============================================
// CHAPTER BUILDERS
// ============================================

function buildAllChapters(readingSections, name) {
    let chaptersHTML = '';
    
    readingSections.forEach((section, idx) => {
        // Chapter title page
        chaptersHTML += `
        <div class="book-page chapter-title-page pdf-page-break-before">
            <div class="chapter-number">Chapter ${romanNumeral(idx + 1)}</div>
            <div class="chapter-icon">${section.icon}</div>
            <div class="chapter-title">${escHtml(section.name)}</div>
            ${section.description ? `<div class="chapter-desc">${escHtml(section.description)}</div>` : ''}
            <div class="chapter-ornament">· · ✦ · ·</div>
        </div>`;
        
        // Reading content pages
        chaptersHTML += `<div class="book-page pdf-page-break-before">`;
        chaptersHTML += `<div class="page-header-decor">${escHtml(section.name)}</div>`;
        
        section.cards.forEach((card, cIdx) => {
            chaptersHTML += buildBookReading(card);
            
            // Add subtle separator between readings (not after last)
            if (cIdx < section.cards.length - 1) {
                chaptersHTML += `<div class="book-section-break">· · · ·</div>`;
            }
        });
        
        chaptersHTML += `</div>`; // close book-page
    });
    
    return chaptersHTML;
}

function buildBookReading(card) {
    let html = `<div class="book-reading pdf-no-break">`;
    
    // Header with title and value
    html += `<div class="book-reading-header">`;
    if (card.icon) {
        html += `<span class="book-reading-icon">${card.icon}</span>`;
    }
    html += `<span class="book-reading-title">${escHtml(card.title)}</span>`;
    if (card.resultValue) {
        html += `<span class="book-reading-value">${escHtml(card.resultValue)}</span>`;
    }
    html += `</div>`;
    
    // Body content
    if (card.content) {
        html += `<div class="book-reading-body">${cleanContentForBook(card.content)}</div>`;
    }
    
    // Keywords
    if (card.keywords && card.keywords.length > 0) {
        html += `<div class="book-keywords">`;
        card.keywords.forEach(kw => {
            html += `<span class="book-keyword">${escHtml(kw)}</span>`;
        });
        html += `</div>`;
    }
    
    // Strengths & Challenges
    if ((card.strengths && card.strengths.length > 0) || (card.challenges && card.challenges.length > 0)) {
        html += `<div class="book-strengths-grid">`;
        if (card.strengths && card.strengths.length > 0) {
            html += `<div class="book-strengths-col"><h5>Gifts</h5><ul>`;
            card.strengths.forEach(s => { html += `<li>${escHtml(s)}</li>`; });
            html += `</ul></div>`;
        }
        if (card.challenges && card.challenges.length > 0) {
            html += `<div class="book-challenges-col"><h5>Growth Areas</h5><ul>`;
            card.challenges.forEach(c => { html += `<li>${escHtml(c)}</li>`; });
            html += `</ul></div>`;
        }
        html += `</div>`;
    }
    
    html += `</div>`; // close book-reading
    return html;
}

function buildClosingPage(name, astro, numr) {
    const sunSign = astro.sunSign.name;
    const moonSign = astro.moonSign.name;
    const lifePath = numr.lifePath;
    
    return `
    <div class="book-page closing-page pdf-page-break-before">
        <div class="closing-ornament">✦ · · ✦ · · ✦</div>
        <div class="closing-title">The Story Continues</div>
        
        <div class="closing-body">
            <p>You have just explored ${escHtml(name)}'s complete moment in time — a unique constellation of energies that has never existed before and will never exist again.</p>
            
            <p>With a ${escHtml(sunSign)} Sun illuminating the core identity, a ${escHtml(moonSign)} Moon nurturing the emotional world, and Life Path ${lifePath} guiding the soul's journey, ${escHtml(name)} carries a sacred combination of gifts.</p>
            
            <p>This reading is a map of possibilities — the cosmic seeds planted at birth. How they blossom depends on love, nurturing, and the choices this soul will make.</p>
            
            <p>Return to these pages whenever you need a reminder of who you truly are beneath all the roles you play.</p>
        </div>
        
        <div class="closing-quote">
            "Every soul arrives with a purpose.<br>
            ${escHtml(name)}'s purpose is written in the stars."
        </div>
        <div class="closing-attribution">— A Moment in Time</div>
    </div>`;
}

function buildColophonPage(name, today) {
    return `
    <div class="book-page colophon-page pdf-page-break-before">
        <div class="colophon-brand">Quantum Merlin</div>
        <div class="colophon-text">
            <strong>A Moment in Time</strong><br>
            A Complete Cosmic Portrait for ${escHtml(name)}<br><br>
            Generated on ${today}<br>
            readings.quantummerlin.com<br><br>
            This reading was generated using precise astronomical calculations<br>
            combined with classical astrological and numerological interpretations.<br><br>
            For entertainment and spiritual reflection purposes.<br>
            Every person is unique and will grow in their own beautiful way.<br><br>
            © ${new Date().getFullYear()} Quantum Merlin. All rights reserved.
        </div>
        <div class="colophon-url">readings.quantummerlin.com</div>
    </div>`;
}

// ============================================
// UTILITIES
// ============================================

function escHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function cleanContentForBook(html) {
    // Remove interactive elements and clean up for book format
    let clean = html;
    
    // Remove buttons, badges, interactive elements
    clean = clean.replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '');
    clean = clean.replace(/<div[^>]*class="[^"]*(?:mark-read|read-badge|expand-icon|action-btn|ad-container|keyword-tag)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
    clean = clean.replace(/<span[^>]*class="[^"]*(?:read-badge|expand-icon|section-arrow|sub-section-arrow)[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');
    
    // Clean up excessive whitespace
    clean = clean.replace(/\s{3,}/g, ' ');
    
    return clean;
}

function romanNumeral(num) {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    return roman[num - 1] || num.toString();
}
