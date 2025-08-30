/* Application State and Constants */
const TOTAL_STEPS = 11;
const SCORES = {
    "PVS1": 32,
    "PS1": 16, "PS2": 16, "PS3": 16, "PS4": 16,
    "PM1": 8, "PM2": 8, "PM3": 8, "PM4": 8, "PM5": 8, "PM6": 8,
    "PP1": 4, "PP2": 4, "PP3": 4, "PP4": 4, "PP5": 4,
    "BA1": 1,
    "BS1": 2, "BS2": 2, "BS3": 2, "BS4": 2,
    "BP1": 3, "BP2": 3, "BP3": 3, "BP4": 3, "BP5": 3, "BP6": 3, "BP7": 3
};

let currentStep = 1;
let formData = {
    variant: '',
    condition: '',
    zygosity: '',
    inheritance: '',
    criteria: {},
    flags: {},
    reasons: []
};

document.addEventListener('DOMContentLoaded', () => {
    updateProgress();
    updateStepIndicator();
    setupEventListeners();
    updateCriteriaSummary();
});

/* Event Listeners */
function setupEventListeners() {
    // Radio button listeners
    document.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
            updateRadioSelection(e.target);
            handleConditionalQuestions(e.target);
            collectCriteria();
            updateCriteriaSummary();
        }
    });

    // Input field listeners with real-time validation
    const variantInput = document.getElementById('variant');
    const conditionInput = document.getElementById('condition');

    variantInput.addEventListener('input', (e) => {
        formData.variant = e.target.value;
        validateInput(e.target, 'variantValidation');
        collectCriteria();
        updateCriteriaSummary();
    });

    conditionInput.addEventListener('input', (e) => {
        formData.condition = e.target.value;
        validateInput(e.target, 'conditionValidation');
        collectCriteria();
        updateCriteriaSummary();
    });

    // Select listeners
    document.getElementById('pf_choice').addEventListener('change', (e) => {
        formData.pf_choice = e.target.value;
        showAf5(e.target.value);
        collectCriteria();
        updateCriteriaSummary();
    });

    document.getElementById('fun_choice').addEventListener('change', (e) => {
        formData.fun_choice = e.target.value;
        collectCriteria();
        updateCriteriaSummary();
    });

    document.getElementById('insili_choice').addEventListener('change', (e) => {
        formData.insili_choice = e.target.value;
        collectCriteria();
        updateCriteriaSummary();
    });

    document.getElementById('rep_choice').addEventListener('change', (e) => {
        formData.rep_choice = e.target.value;
        collectCriteria();
        updateCriteriaSummary();
    });

    // Button listeners
    document.getElementById('prevButton').addEventListener('click', previousStep);
    document.getElementById('nextButton').addEventListener('click', nextStep);
    document.getElementById('classifyButton').addEventListener('click', classifyVariant);

    // Summary toggle
    document.getElementById('summaryToggle').addEventListener('click', toggleSummary);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentStep > 1) previousStep();
        if (e.key === 'ArrowRight' && currentStep < TOTAL_STEPS) nextStep();
        if (e.key === 'Enter' && currentStep === TOTAL_STEPS) classifyVariant();
    });
}

/* UI Updates */
function updateRadioSelection(radio) {
    const group = radio.name;
    const value = radio.value;
    
    // Update visual selection
    document.querySelectorAll(`input[name="${group}"]`).forEach(option => {
        const label = option.closest('.radio-option');
        label.classList.toggle('selected', option === radio);
    });

    // Store form data
    formData[group] = value;
}

function updateProgress() {
    const progress = (currentStep / TOTAL_STEPS) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;

    // Highlight active step
    document.querySelectorAll('.step-card').forEach(card => {
        card.classList.toggle('active', parseInt(card.dataset.step) === currentStep);
    });
}

function updateStepIndicator() {
    document.getElementById('stepIndicator').textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
}

function updateNavigation() {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const classifyButton = document.getElementById('classifyButton');

    prevButton.disabled = currentStep === 1;
    nextButton.classList.toggle('hidden', currentStep === TOTAL_STEPS);
    classifyButton.classList.toggle('hidden', currentStep !== TOTAL_STEPS);
}

function toggleSummary() {
    const summaryContent = document.getElementById('summaryContent');
    const toggleButton = document.getElementById('summaryToggle');
    summaryContent.classList.toggle('hidden');
    toggleButton.textContent = summaryContent.classList.contains('hidden') ? 'Show Criteria Summary' : 'Hide Criteria Summary';
}

/* Real-time Validation */
function validateInput(input, validationId) {
    const validationMessage = document.getElementById(validationId);
    if (input.value.trim() === '') {
        input.classList.add('invalid');
        validationMessage.textContent = 'This field is required';
        validationMessage.classList.add('show');
    } else {
        input.classList.remove('invalid');
        validationMessage.classList.remove('show');
    }
}

/* Conditional Section Visibility */
function showMissenseSubs(show) {
    document.getElementById('missense-sub').classList.toggle('hidden', !show);
}

function showNonMissenseAlt(show) {
    document.getElementById('non-missense-alt').classList.toggle('hidden', !show);
}

function showAltBasis(show) {
    document.getElementById('alt-basis-sub').classList.toggle('hidden', !show);
}

function showSegResult(show) {
    document.getElementById('seg-result').classList.toggle('hidden', !show);
}

function showDeNovo(show) {
    document.getElementById('de-novo').classList.toggle('hidden', !show);
}

function showAf5(value) {
    document.getElementById('af-5').classList.toggle('hidden', value !== 'b');
}

function showRepetitive(show) {
    document.getElementById('repetitive').classList.toggle('hidden', !show);
}

function handleConditionalQuestions(radio) {
    const name = radio.name;
    const value = radio.value;

    if (name === 'missense') {
        showMissenseSubs(value === 'yes');
        showNonMissenseAlt(value === 'no');
    } else if (name === 'mechanism') {
        showAltBasis(value === 'no');
    } else if (name === 'segregation_done') {
        showSegResult(value === 'yes');
        showDeNovo(value === 'no');
    } else if (name === 'variant_effect') {
        showRepetitive(value === 'no');
    }
}

/* Navigation Logic */
function nextStep() {
    if (!validateCurrentStep()) return;

    if (currentStep < TOTAL_STEPS) {
        const currentCard = document.getElementById(`step${currentStep}`);
        currentCard.classList.add('fade-out');
        setTimeout(() => {
            currentCard.classList.add('hidden');
            currentCard.classList.remove('fade-out');
            currentStep++;
            const nextCard = document.getElementById(`step${currentStep}`);
            nextCard.classList.remove('hidden');
            nextCard.classList.add('fade-in');
            setTimeout(() => {
                nextCard.classList.remove('fade-in');
            }, 300);
            updateProgress();
            updateStepIndicator();
            updateNavigation();
        }, 300);
    }
}

function previousStep() {
    if (currentStep > 1) {
        const currentCard = document.getElementById(`step${currentStep}`);
        currentCard.classList.add('fade-out');
        setTimeout(() => {
            currentCard.classList.add('hidden');
            currentCard.classList.remove('fade-out');
            currentStep--;
            const prevCard = document.getElementById(`step${currentStep}`);
            prevCard.classList.remove('hidden');
            prevCard.classList.add('fade-in');
            setTimeout(() => {
                prevCard.classList.remove('fade-in');
            }, 300);
            updateProgress();
            updateStepIndicator();
            updateNavigation();
        }, 300);
    }
}

function validateCurrentStep() {
    if (currentStep === 1) {
        const variant = document.getElementById('variant').value.trim();
        const condition = document.getElementById('condition').value.trim();
        
        if (!variant || !condition) {
            validateInput(document.getElementById('variant'), 'variantValidation');
            validateInput(document.getElementById('condition'), 'conditionValidation');
            return false;
        }
    }
    return true;
}

/* Criteria Collection (Updated to match Python logic for consistency) */
function collectCriteria() {
    let criteria = {};
    let reasons = [];
    let flags = { FUNCTIONAL_NOT_DONE: false, PM1_NO: false };
    
    function addCriterion(tag, why) {
        criteria[tag] = (criteria[tag] || 0) + 1;
        reasons.push([tag, why]);
    }
    
    function addInfo(why) {
        reasons.push(["INFO", why]);
    }
    
    // Step 1: Basic Information
    const geneAssoc = document.querySelector('input[name="gene_assoc"]:checked')?.value || 'skip';
    if (geneAssoc === 'yes') addCriterion("PP4", "Gene is associated with condition.");
    else if (geneAssoc === 'no') addInfo("Gene not associated with condition.");
    else addInfo("Gene-disease association information not available.");
    
    // Step 2: Variant Characterization
    const nullVariant = document.querySelector('input[name="null_variant"]:checked')?.value || 'skip';
    if (nullVariant === 'yes') addCriterion("PVS1", "Predicted null variant in gene where LoF is a known mechanism.");
    else if (nullVariant === 'skip') addInfo("Null variant status information not available.");
    
    const missense = document.querySelector('input[name="missense"]:checked')?.value || 'skip';
    if (missense === 'skip') addInfo("Missense variant status information not available.");
    else if (missense === 'yes') {
        const novel = document.querySelector('input[name="novel"]:checked')?.value || 'skip';
        if (novel === 'skip') addInfo("Novel missense status information not available.");
        
        const sameAa = document.querySelector('input[name="same_aa"]:checked')?.value || 'skip';
        if (sameAa === 'yes') addCriterion("PS1", "Same AA change as established pathogenic variant.");
        else if (sameAa === 'skip') addInfo("Same amino acid change information not available.");
        
        if (novel === 'yes') {
            const diffAa = document.querySelector('input[name="diff_aa"]:checked')?.value || 'skip';
            if (diffAa === 'yes') addCriterion("PM5", "Novel missense at residue with other known pathogenic missense.");
            else if (diffAa === 'skip') addInfo("Different amino acid substitution information not available.");
        }
        
        const mechanism = document.querySelector('input[name="mechanism"]:checked')?.value || 'skip';
        if (mechanism === 'yes') addCriterion("PP2", "Missense mechanism established for this disorder.");
        else if (mechanism === 'skip') addInfo("Missense mechanism information not available.");
        else if (mechanism === 'no') {
            addCriterion("BP1", "Missense mechanism is not the cause for this disorder.");
            const altBasis = document.querySelector('input[name="alt_basis"]:checked')?.value || 'skip';
            if (altBasis === 'yes') addCriterion("BP5", "Alternative molecular basis for this disorder.");
            else if (altBasis === 'skip') addInfo("Alternative molecular basis information not available.");
        }
    } else {
        const altBasisNon = document.querySelector('input[name="alt_basis_non"]:checked')?.value || 'skip';
        if (altBasisNon === 'yes') addCriterion("BP5", "Alternative molecular basis for this disorder.");
        else if (altBasisNon === 'skip') addInfo("Alternative molecular basis information not available.");
    }
    
    // Step 3: Segregation Analysis
    const segregationDone = document.querySelector('input[name="segregation_done"]:checked')?.value || 'skip';
    if (segregationDone === 'skip') addInfo("Segregation analysis information not available.");
    else if (segregationDone === 'yes') {
        const segChoice = document.querySelector('input[name="seg_choice"]:checked')?.value || 'skip';
        if (segChoice === 'skip') addInfo("Segregation result information not available.");
        else {
            const inheritance = document.querySelector('input[name="inheritance"]:checked')?.value || 'skip';
            const zygosity = document.querySelector('input[name="zygosity"]:checked')?.value || 'skip';
            if (inheritance === 'ad' && segChoice === 'a') addCriterion("PS2", "De novo in autosomal dominant context (parents negative).");
            if ((inheritance === 'ad' || (inheritance === 'ar' && zygosity === 'homo')) && segChoice === 'b') addCriterion("BS4", "Present in parents inconsistent with expected segregation.");
            if (inheritance === 'ar' && zygosity === 'hetero' && segChoice === 'c') addCriterion("PP1", "Segregation supportive with both parents carriers.");
            if (inheritance === 'xr' && segChoice === 'd') addCriterion("PP1", "X-linked present only in mother, supports segregation.");
        }
    } else {
        const deNovo = document.querySelector('input[name="de_novo"]:checked')?.value || 'skip';
        if (deNovo === 'yes') addCriterion("PM6", "Assumed de novo without confirmation of maternity and paternity.");
        else if (deNovo === 'skip') addInfo("De novo assumption information not available.");
    }
    
    // Step 4: Functional Analysis
    const funChoice = document.getElementById('fun_choice')?.value || 'skip';
    if (funChoice === 'a') addCriterion("PS3", "Well-established functional studies supportive of damaging effect.");
    else if (funChoice === 'b') addCriterion("BS3", "Functional studies show no damaging effect.");
    else if (funChoice === 'c') { flags.FUNCTIONAL_NOT_DONE = true; addInfo("Functional studies have not been done."); }
    else addInfo("Functional analysis information not available.");
    
    // Step 5: Population Frequency
    const pfChoice = document.getElementById('pf_choice')?.value || 'skip';
    if (pfChoice === 'a') addCriterion("PS4", "<1% in affected versus controls.");
    else if (pfChoice === 'c') addCriterion("PM2", "Not observed in population databases.");
    else if (pfChoice === 'b') {
        const af5 = document.querySelector('input[name="af_5"]:checked')?.value || 'skip';
        if (af5 === 'yes') addCriterion("BA1", "Allele frequency ≥5% (stand-alone benign).");
        else if (af5 === 'skip') addInfo("Allele frequency ≥5% information not available.");
    } else if (pfChoice === 'd') {
        const inheritance = document.querySelector('input[name="inheritance"]:checked')?.value || 'skip';
        const zygosity = document.querySelector('input[name="zygosity"]:checked')?.value || 'skip';
        if ((inheritance === 'ad' && zygosity === 'hetero') || (inheritance === 'ar' && zygosity === 'homo') || ((inheritance === 'xd' || inheritance === 'xr') && zygosity === 'hemi')) {
            addCriterion("BS2", "Observed in healthy individuals in genotype inconsistent with disease.");
        }
    } else if (pfChoice === 'e') addCriterion("BS1", "Allele frequency greater than expected for disorder.");
    else addInfo("Population frequency information not available.");
    
    // Step 6: Variant Position
    const hotspot = document.querySelector('input[name="hotspot"]:checked')?.value || 'skip';
    if (hotspot === 'yes') addCriterion("PM1", "Located in mutational hotspot/critical domain.");
    else if (hotspot === 'no') { flags.PM1_NO = true; addInfo("Not located in mutational hotspot/critical domain."); }
    else addInfo("Hotspot/domain information not available.");
    
    // Step 7: Cis/Trans
    const ynTrans = document.querySelector('input[name="yn_trans"]:checked')?.value || 'skip';
    if (ynTrans === 'yes') {
        const inheritance = document.querySelector('input[name="inheritance"]:checked')?.value || 'skip';
        if (inheritance === 'ad') addCriterion("BP2", "In AD, second variant in trans argues against causality for this variant.");
        else addCriterion("PM3", "In trans with known P/LP variant.");
    } else if (ynTrans === 'no') addCriterion("BP2", "Not in trans with known P/LP variant.");
    else addInfo("Cis/trans information not available.");
    
    // Step 8: Variant Effect
    const variantEffect = document.querySelector('input[name="variant_effect"]:checked')?.value || 'skip';
    if (variantEffect === 'yes') addCriterion("PM4", "Protein length changing (inframe indels/stop-loss).");
    else if (variantEffect === 'no') {
        const repetitive = document.querySelector('input[name="repetitive"]:checked')?.value || 'skip';
        if (repetitive === 'yes') addCriterion("BP3", "Located in low complexity/repetitive region.");
        else if (repetitive === 'skip') addInfo("Repetitive region information not available.");
    } else addInfo("Variant effect information not available.");
    
    // Step 9: In Silico Predictions
    const insiliChoice = document.getElementById('insili_choice')?.value || 'skip';
    if (insiliChoice === 'a') addCriterion("PP3", "Multiple computational predictions support deleterious effect.");
    else if (insiliChoice === 'b') addCriterion("BP4", "Computational predictions suggest no impact.");
    else if (insiliChoice === 'c') addInfo("Conflicting in silico results.");
    else addInfo("In silico prediction information not available.");
    
    // Step 10: Reputable Source
    const repChoice = document.getElementById('rep_choice')?.value || 'skip';
    if (repChoice === 'a') addCriterion("PP5", "Reputable source classifies as pathogenic.");
    else if (repChoice === 'b') addCriterion("BP6", "Reputable source classifies as benign.");
    else if (repChoice === 'c') addInfo("Reputable source is not available.");
    else addInfo("Reputable source information not available.");
    
    // Step 11: Synonymous
    const synonymous = document.querySelector('input[name="synonymous"]:checked')?.value || 'skip';
    if (synonymous === 'yes') addCriterion("BP7", "Synonymous with no splice impact.");
    else if (synonymous === 'skip') addInfo("Synonymous variant information not available.");
    
    formData.criteria = criteria;
    formData.reasons = reasons;
    formData.flags = flags;
}

/* Criteria Summary */
function updateCriteriaSummary() {
    collectCriteria();
    const criteriaList = document.getElementById('criteriaList');
    criteriaList.innerHTML = '';

    formData.reasons.forEach(([tag, reason]) => {
        const li = document.createElement('li');
        li.className = 'evidence-item';
        li.innerHTML = `
            <span class="evidence-tag">${tag}</span>
            <span>${reason}</span>
            ${tag !== 'INFO' ? `<span class="evidence-score">${SCORES[tag] || 0} points</span>` : ''}
        `;
        criteriaList.appendChild(li);
    });

    if (formData.reasons.length === 0) {
        criteriaList.innerHTML = '<li class="evidence-item">No criteria selected yet.</li>';
    }
}

/* Number Animation */
function animateCount(element, target, duration = 1000) {
    let start = 0;
    const step = target / (duration / 20);
    const interval = setInterval(() => {
        start += step;
        if (start >= target) {
            start = target;
            clearInterval(interval);
        }
        element.textContent = Math.round(start);
    }, 20);
}

/* Ported Python Logic Utilities */
function map_yn(value) {
    if (value === 'yes') return true;
    if (value === 'no') return false;
    return 'skip';
}

function add_criterion(bag, tag, why, reasons) {
    if (!bag[tag]) bag[tag] = 0;
    bag[tag] += 1;
    reasons.push({tag, why});
}

function add_info(why, reasons) {
    reasons.push({tag: "INFO", why});
}

function count_groups(bag) {
    let pvs = bag["PVS1"] || 0;
    let ps = 0;
    let pm = 0;
    let pp = 0;
    let ba1 = bag["BA1"] || 0;
    let bs = 0;
    let bp = 0;
    for (let k in bag) {
        if (k.startsWith("PS")) ps += bag[k];
        if (k.startsWith("PM")) pm += bag[k];
        if (k.startsWith("PP")) pp += bag[k];
        if (k.startsWith("BS")) bs += bag[k];
        if (k.startsWith("BP")) bp += bag[k];
    }
    return {pvs, ps, pm, pp, ba1, bs, bp};
}

function total_score_from_criteria(bag) {
    let total = 0;
    for (let tag in bag) {
        total += (SCORES[tag] || 0) * bag[tag];
    }
    return total;
}

function has_strong_evidence(bag) {
    if (bag["PVS1"] > 0) return true;
    for (let k in bag) {
        if (k.startsWith("PS") && bag[k] > 0) return true;
        if (k.startsWith("PM") && k !== "PM6" && bag[k] > 0) return true;
    }
    return false;
}

function acmg_rule_classification(criteria_bag) {
    const {pvs, ps, pm, pp, ba1, bs, bp} = count_groups(criteria_bag);
    let path_class = null;
    let benign_class = null;
    let reason_text = "";

    const total_pathogenic_strength = (pvs * 32) + (ps * 16) + (pm * 8) + (pp * 4);
    const total_benign_strength = (ba1 * 1) + (bs * 2) + (bp * 3);
    
    if (total_pathogenic_strength > 0 && total_pathogenic_strength >= total_benign_strength * 3) {
        if (pvs >= 1) {
            if (ps >= 1) {
                path_class = "Pathogenic";
                reason_text = "1 Very Strong (PVS1) + ≥1 Strong (PS) - pathogenic evidence outweighs benign.";
            } else if (pm >= 2) {
                path_class = "Pathogenic";
                reason_text = "1 Very Strong (PVS1) + ≥2 Moderate (PM) - pathogenic evidence outweighs benign.";
            } else if (pm >= 1 && pp >= 1) {
                path_class = "Pathogenic";
                reason_text = "1 Very Strong (PVS1) + 1 Moderate + 1 Supporting - pathogenic evidence outweighs benign.";
            } else if (pp >= 2) {
                path_class = "Pathogenic";
                reason_text = "1 Very Strong (PVS1) + ≥2 Supporting - pathogenic evidence outweighs benign.";
            }
        } else if (ps >= 2) {
            path_class = "Pathogenic";
            reason_text = "≥2 Strong (PS1–PS4) - pathogenic evidence outweighs benign.";
        } else if (ps >= 1 && pm >= 3) {
            path_class = "Pathogenic";
            reason_text = "1 Strong + ≥3 Moderate - pathogenic evidence outweighs benign.";
        } else if (ps >= 1 && pm >= 2 && pp >= 2) {
            path_class = "Pathogenic";
            reason_text = "1 Strong + 2 Moderate + ≥2 Supporting - pathogenic evidence outweighs benign.";
        } else if (ps >= 1 && pm >= 1 && pp >= 4) {
            path_class = "Pathogenic";
            reason_text = "1 Strong + 1 Moderate + ≥4 Supporting - pathogenic evidence outweighs benign.";
        } else if (pvs >= 1 && pm >= 1) {
            path_class = "Likely Pathogenic";
            reason_text = "1 Very Strong + 1 Moderate - pathogenic evidence outweighs benign.";
        } else if (ps >= 1 && pm >= 1 && pm <= 2) {
            path_class = "Likely Pathogenic";
            reason_text = "1 Strong + 1–2 Moderate - pathogenic evidence outweighs benign.";
        } else if (ps >= 1 && pp >= 2) {
            path_class = "Likely Pathogenic";
            reason_text = "1 Strong + ≥2 Supporting - pathogenic evidence outweighs benign.";
        } else if (pm >= 3) {
            path_class = "Likely Pathogenic";
            reason_text = "≥3 Moderate - pathogenic evidence outweighs benign.";
        } else if (pm >= 2 && pp >= 2) {
            path_class = "Likely Pathogenic";
            reason_text = "2 Moderate + ≥2 Supporting - pathogenic evidence outweighs benign.";
        } else if (pm >= 1 && pp >= 4) {
            path_class = "Likely Pathogenic";
            reason_text = "1 Moderate + ≥4 Supporting - pathogenic evidence outweighs benign.";
        }
    } else if (total_benign_strength > 0 && total_benign_strength >= total_pathogenic_strength * 2) {
        if (ba1 >= 1) {
            benign_class = "Benign";
            reason_text = "Stand-alone benign (BA1) - benign evidence outweighs pathogenic.";
        } else if (bs >= 2) {
            benign_class = "Benign";
            reason_text = "≥2 strong benign (BS1–BS4) - benign evidence outweighs pathogenic.";
        } else if (bs >= 1 && bp >= 1) {
            benign_class = "Likely Benign";
            reason_text = "1 strong benign + 1 supporting benign - benign evidence outweighs pathogenic.";
        } else if (bp >= 2) {
            benign_class = "Likely Benign";
            reason_text = "≥2 supporting benign (BP1–BP7) - benign evidence outweighs pathogenic.";
        }
    } else {
        if (ba1 >= 1) {
            benign_class = "Benign";
            reason_text = "Stand-alone benign (BA1).";
        } else if (bs >= 2) {
            benign_class = "Benign";
            reason_text = "≥2 strong benign (BS1–BS4).";
        } else if (bs >= 1 && bp >= 1) {
            benign_class = "Likely Benign";
            reason_text = "1 strong benign + 1 supporting benign.";
        } else if (bp >= 2) {
            benign_class = "Likely Benign";
            reason_text = "≥2 supporting benign (BP1–BP7).";
        } else if (pvs >= 1) {
            if (ps >= 1) {
                path_class = "Pathogenic";
                reason_text = "1 Very Strong (PVS1) + ≥1 Strong (PS).";
            } else if (pm >= 2) {
                path_class = "Pathogenic";
                reason_text = "1 Very Strong (PVS1) + ≥2 Moderate (PM).";
            } else if (pm >= 1 && pp >= 1) {
                path_class = "Pathogenic";
                reason_text = "1 Very Strong (PVS1) + 1 Moderate + 1 Supporting.";
            } else if (pp >= 2) {
                path_class = "Pathogenic";
                reason_text = "1 Very Strong (PVS1) + ≥2 Supporting.";
            }
        } else if (ps >= 2) {
            path_class = "Pathogenic";
            reason_text = "≥2 Strong (PS1–PS4).";
        } else if (ps >= 1 && pm >= 3) {
            path_class = "Pathogenic";
            reason_text = "1 Strong + ≥3 Moderate.";
        } else if (ps >= 1 && pm >= 2 && pp >= 2) {
            path_class = "Pathogenic";
            reason_text = "1 Strong + 2 Moderate + ≥2 Supporting.";
        } else if (ps >= 1 && pm >= 1 && pp >= 4) {
            path_class = "Pathogenic";
            reason_text = "1 Strong + 1 Moderate + ≥4 Supporting.";
        } else if (pvs >= 1 && pm >= 1) {
            path_class = "Likely Pathogenic";
            reason_text = "1 Very Strong + 1 Moderate.";
        } else if (ps >= 1 && pm >= 1 && pm <= 2) {
            path_class = "Likely Pathogenic";
            reason_text = "1 Strong + 1–2 Moderate.";
        } else if (ps >= 1 && pp >= 2) {
            path_class = "Likely Pathogenic";
            reason_text = "1 Strong + ≥2 Supporting.";
        } else if (pm >= 3) {
            path_class = "Likely Pathogenic";
            reason_text = "≥3 Moderate.";
        } else if (pm >= 2 && pp >= 2) {
            path_class = "Likely Pathogenic";
            reason_text = "2 Moderate + ≥2 Supporting.";
        } else if (pm >= 1 && pp >= 4) {
            path_class = "Likely Pathogenic";
            reason_text = "1 Moderate + ≥4 Supporting.";
        } else {
            reason_text = "No ACMG combination rule matched.";
        }
    }
    return {path_class, benign_class, reason_text};
}

function classify_variant(answers) {
    const variant = answers.variant || '';
    const condition = answers.condition || '';
    const zygosity = answers.zygosity || 'skip';
    const inheritance = answers.inheritance || 'skip';

    let criteria = {};
    let reasons = [];
    let flags = { FUNCTIONAL_NOT_DONE: false, PM1_NO: false };

    let gene_assoc = map_yn(answers.gene_assoc);
    if (gene_assoc === 'skip') {
        add_info("Gene-disease association information not available.", reasons);
    } else if (gene_assoc) {
        add_criterion(criteria, "PP4", "Gene is associated with condition.", reasons);
    } else {
        add_info("Gene not associated with condition.", reasons);
    }

    let null_variant = map_yn(answers.null_variant);
    if (null_variant === 'skip') {
        add_info("Null variant status information not available.", reasons);
    } else if (null_variant) {
        add_criterion(criteria, "PVS1", "Predicted null variant in gene where LoF is a known mechanism.", reasons);
    }

    let missense = map_yn(answers.missense);
    if (missense === 'skip') {
        add_info("Missense variant status information not available.", reasons);
    } else if (missense) {
        let novel = map_yn(answers.novel);
        if (novel === 'skip') {
            add_info("Novel missense status information not available.", reasons);
        }
        let same_aa = map_yn(answers.same_aa);
        if (same_aa === 'skip') {
            add_info("Same amino acid change information not available.", reasons);
        } else if (same_aa) {
            add_criterion(criteria, "PS1", "Same AA change as established pathogenic variant.", reasons);
        }
        if (novel && novel !== 'skip') {
            let diff_aa = map_yn(answers.diff_aa);
            if (diff_aa === 'skip') {
                add_info("Different amino acid substitution information not available.", reasons);
            } else if (diff_aa) {
                add_criterion(criteria, "PM5", "Novel missense at residue with other known pathogenic missense.", reasons);
            }
        }
        let mechanism = map_yn(answers.mechanism);
        if (mechanism === 'skip') {
            add_info("Missense mechanism information not available.", reasons);
        } else if (mechanism) {
            add_criterion(criteria, "PP2", "Missense mechanism established for this disorder.", reasons); 
        } else {
            add_criterion(criteria, "BP1", "Missense mechanism is not the cause for this disorder.", reasons);
            let alt_basis = map_yn(answers.alt_basis);
            if (alt_basis === 'skip') {
                add_info("Alternative molecular basis information not available.", reasons);
            } else if (alt_basis) {
                add_criterion(criteria, "BP5", "Alternative molecular basis for this disorder.", reasons);
            }
        }
    } else {
        let alt_basis = map_yn(answers.alt_basis_non);
        if (alt_basis === 'skip') {
            add_info("Alternative molecular basis information not available.", reasons);
        } else if (alt_basis) {
            add_criterion(criteria, "BP5", "Alternative molecular basis for this disorder.", reasons);
        }
    }

    let segregation_done = map_yn(answers.segregation_done);
    if (segregation_done === 'skip') {
        add_info("Segregation analysis information not available.", reasons);
    } else if (segregation_done) {
        let seg_choice = answers.seg_choice || 'skip';
        if (seg_choice === 'skip') {
            add_info("Segregation result information not available.", reasons);
        } else {
            if (inheritance !== 'skip' && inheritance === "ad" && seg_choice === "a") {
                add_criterion(criteria, "PS2", "De novo in autosomal dominant context (parents negative).", reasons);
            }
            if (inheritance !== 'skip' && (inheritance === "ad" || (zygosity !== 'skip' && zygosity === "homo" && inheritance === "ar")) && seg_choice === "b") {
                add_criterion(criteria, "BS4", "Present in parents inconsistent with expected segregation.", reasons);
            }
            if (inheritance !== 'skip' && zygosity !== 'skip' && zygosity === "hetero" && inheritance === "ar" && seg_choice === "c") {
                add_criterion(criteria, "PP1", "Segregation supportive with both parents carriers.", reasons);
            }
            if (inheritance !== 'skip' && inheritance === "xr" && seg_choice === "d") {
                add_criterion(criteria, "PP1", "X-linked present only in mother, supports segregation.", reasons);
            }
        }
    } else {
        let de_novo = map_yn(answers.de_novo);
        if (de_novo === 'skip') {
            add_info("De novo assumption information not available.", reasons);
        } else if (de_novo) {
            add_criterion(criteria, "PM6", "Assumed de novo without confirmation of maternity and paternity.", reasons);
        }
    }

    let fun_choice = answers.fun_choice || 'skip';
    if (fun_choice === 'skip') {
        add_info("Functional analysis information not available.", reasons);
    } else if (fun_choice === "a") {
        add_criterion(criteria, "PS3", "Well-established functional studies supportive of damaging effect.", reasons);
    } else if (fun_choice === "b") {
        add_criterion(criteria, "BS3", "Functional studies show no damaging effect.", reasons);
    } else if (fun_choice === "c") {
        flags["FUNCTIONAL_NOT_DONE"] = true
        add_info("Functional studies have not been done.", reasons);
    }

    let pf_choice = answers.pf_choice || 'skip';
    if (pf_choice === 'skip') {
        add_info("Population frequency information not available.", reasons);
    } else if (pf_choice === "a") {
        add_criterion(criteria, "PS4", "<1% in affected versus controls.", reasons);
    } else if (pf_choice === "c") {
        add_criterion(criteria, "PM2", "Not observed in population databases.", reasons);
    } else if (pf_choice === "b") {
        let af_5 = map_yn(answers.af_5);
        if (af_5 === 'skip') {
            add_info("Allele frequency ≥5% information not available.", reasons);
        } else if (af_5) {
            add_criterion(criteria, "BA1", "Allele frequency ≥5% (stand-alone benign).", reasons);
        }
    } else if (pf_choice === "d") {
        if (inheritance !== "skip" && zygosity !== "skip" && 
            ((inheritance === "ad" && zygosity === "hetero") ||
             (inheritance === "ar" && zygosity === "homo") ||
             ((inheritance === "xd" || inheritance === "xr") && zygosity === "hemi"))) {
                add_criterion(criteria, "BS2", "Observed in healthy individuals in genotype inconsistent with disease.", reasons);
        }
    } else if (pf_choice === "e") {
        add_criterion(criteria, "BS1", "Allele frequency greater than expected for disorder.", reasons);
    }

    let hotspot = map_yn(answers.hotspot);
    if (hotspot === 'skip') {
        add_info("Hotspot/domain information not available.", reasons);
    } else if (hotspot) {
        add_criterion(criteria, "PM1", "Located in mutational hotspot/critical domain.", reasons);
    } else {
        flags["PM1_NO"] = true;
        add_info("Not located in mutational hotspot/critical domain.", reasons);
    }

    let yn_trans = map_yn(answers.yn_trans);
    if (yn_trans === 'skip') {
        add_info("Cis/trans information not available.", reasons);
    } else if (yn_trans) {
        if (inheritance !== "skip" && inheritance === "ad") {
            add_criterion(criteria, "BP2", "In AD, second variant in trans argues against causality for this variant.", reasons);
        } else {
            add_criterion(criteria, "PM3", "In trans with known P/LP variant.", reasons);
        }
    } else {
        add_criterion(criteria, "BP2", "Not in trans with known P/LP variant.", reasons);
    }

    let variant_effect = map_yn(answers.variant_effect);
    if (variant_effect === 'skip') {
        add_info("Variant effect information not available.", reasons);
    } else if (variant_effect) {
        add_criterion(criteria, "PM4", "Protein length changing (inframe indels/stop-loss).", reasons);
    } else {
        let repetitive = map_yn(answers.repetitive);
        if (repetitive === 'skip') {
            add_info("Repetitive region information not available.", reasons);
        } else if (repetitive) {
            add_criterion(criteria, "BP3", "Located in low complexity/repetitive region.", reasons);
        }
    }

    let insili_choice = answers.insili_choice || 'skip';
    if (insili_choice === 'skip') {
        add_info("In silico predictions information not available.", reasons);
    } else if (insili_choice === "a") {
        add_criterion(criteria, "PP3", "Multiple computational predictions support deleterious effect.", reasons);
    } else if (insili_choice === "b") {
        add_criterion(criteria, "BP4", "Computational predictions suggest no impact.", reasons);
    } else if (insili_choice === "c") {
        add_info("Conflicting in silico results.", reasons);
    }

    let rep_choice = answers.rep_choice || 'skip';
    if (rep_choice === 'skip') {
        add_info("Reputable source information not available.", reasons);
    } else if (rep_choice === "a") {
        add_criterion(criteria, "PP5", "Reputable source classifies as pathogenic.", reasons);
    } else if (rep_choice === "b") {
        add_criterion(criteria, "BP6", "Reputable source classifies as benign.", reasons);
    } else if (rep_choice === "c") {
        add_info("Reputable source is not available.", reasons);
    }

    let synonymous = map_yn(answers.synonymous);
    if (synonymous === 'skip') {
        add_info("Synonymous variant information not available.", reasons);
    } else if (synonymous) {
        add_criterion(criteria, "BP7", "Synonymous with no splice impact.", reasons);
    }

    const {path_class, benign_class, reason_text: rule_reason} = acmg_rule_classification(criteria);
    
    const {pvs, ps, pm, pp, ba1, bs, bp} = count_groups(criteria);
    const total_pathogenic_strength = (pvs * 32) + (ps * 16) + (pm * 8) + (pp * 4);
    const total_benign_strength = (ba1 * 1) + (bs * 2) + (bp * 3);
    const total_score = total_score_from_criteria(criteria);

    let final_class = null;
    let reason_text = "";

    if (path_class && !benign_class) {
        final_class = path_class;
        reason_text = rule_reason;
    } else if (benign_class && !path_class) {
        final_class = benign_class;
        reason_text = rule_reason;
    } else if (path_class && benign_class) {
        if (total_pathogenic_strength >= total_benign_strength * 2) {
            final_class = path_class;
            reason_text = `Conflicting evidence resolved: Pathogenic evidence (score ${total_pathogenic_strength}) outweighs benign evidence (score ${total_benign_strength}).`;
        } else if (total_benign_strength >= total_pathogenic_strength * 2) {
            final_class = benign_class;
            reason_text = `Conflicting evidence resolved: Benign evidence (score ${total_benign_strength}) outweighs pathogenic evidence (score ${total_pathogenic_strength}).`;
        } else {
            final_class = "VUS (Variant of Uncertain Significance)";
            reason_text = `Conflicting evidence: Both pathogenic (score ${total_pathogenic_strength}) and benign (score ${total_benign_strength}) evidence with comparable strength. Defaulting to VUS.`;
        }
    } else if (!final_class) {
        if (!has_strong_evidence(criteria)) {
            if (flags.FUNCTIONAL_NOT_DONE) {
                final_class = "VUS (Variant of Uncertain Significance)";
                reason_text = "Functional studies not done and no strong evidence.";
            } else if (flags.PM1_NO) {
                final_class = "VUS (Variant of Uncertain Significance)";
                reason_text = "Not in hotspot/domain and no strong evidence.";
            } else if (criteria["PM6"] > 0) {
                final_class = "VUS (Variant of Uncertain Significance)";
                reason_text = "Assumed de novo (PM6) with no strong evidence.";
            } else if (criteria["BS2"] > 0) {
                final_class = "VUS (Variant of Uncertain Significance)";
                reason_text = "Observed in healthy individuals (BS2) with no strong evidence.";
            } else if (criteria["BP5"] > 0) {
                final_class = "VUS (Variant of Uncertain Significance)";
                reason_text = "Alternative molecular basis (BP5) with no strong evidence.";
            }
        }
    }

    if (!final_class) {
        final_class = "VUS (Variant of Uncertain Significance)";
        reason_text = `Score-based classification: ${total_score} points.`;
    }

    if (!final_class) {
        final_class = "VUS (Variant of Uncertain Significance)";
        reason_text = "Default classification due to insufficient evidence.";
    }

    const filtered_reasons = reasons.filter(r => r.tag !== 'INFO');

    return {
        final_class,
        reason_text,
        pvs,
        ps,
        pm,
        pp,
        ba1,
        bs,
        bp,
        total_score,
        total_pathogenic_strength,
        total_benign_strength,
        reasons: filtered_reasons,
        variant,
        condition,
        zygosity,
        inheritance
    };
}

/* Classification Logic */
function classifyVariant() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
    document.getElementById('classificationResult').classList.add('hidden');

    let answers = {
        variant: document.getElementById('variant').value,
        condition: document.getElementById('condition').value,
        zygosity: document.querySelector('input[name="zygosity"]:checked')?.value || 'skip',
        inheritance: document.querySelector('input[name="inheritance"]:checked')?.value || 'skip',
        gene_assoc: document.querySelector('input[name="gene_assoc"]:checked')?.value || 'skip',
        null_variant: document.querySelector('input[name="null_variant"]:checked')?.value || 'skip',
        missense: document.querySelector('input[name="missense"]:checked')?.value || 'skip',
        novel: document.querySelector('input[name="novel"]:checked')?.value || 'skip',
        same_aa: document.querySelector('input[name="same_aa"]:checked')?.value || 'skip',
        diff_aa: document.querySelector('input[name="diff_aa"]:checked')?.value || 'skip',
        mechanism: document.querySelector('input[name="mechanism"]:checked')?.value || 'skip',
        alt_basis: document.querySelector('input[name="alt_basis"]:checked')?.value || 'skip',
        alt_basis_non: document.querySelector('input[name="alt_basis_non"]:checked')?.value || 'skip',
        segregation_done: document.querySelector('input[name="segregation_done"]:checked')?.value || 'skip',
        seg_choice: document.querySelector('input[name="seg_choice"]:checked')?.value || 'skip',
        de_novo: document.querySelector('input[name="de_novo"]:checked')?.value || 'skip',
        fun_choice: document.getElementById('fun_choice').value || 'skip',
        pf_choice: document.getElementById('pf_choice').value || 'skip',
        af_5: document.querySelector('input[name="af_5"]:checked')?.value || 'skip',
        hotspot: document.querySelector('input[name="hotspot"]:checked')?.value || 'skip',
        yn_trans: document.querySelector('input[name="yn_trans"]:checked')?.value || 'skip',
        variant_effect: document.querySelector('input[name="variant_effect"]:checked')?.value || 'skip',
        repetitive: document.querySelector('input[name="repetitive"]:checked')?.value || 'skip',
        insili_choice: document.getElementById('insili_choice').value || 'skip',
        rep_choice: document.getElementById('rep_choice').value || 'skip',
        synonymous: document.querySelector('input[name="synonymous"]:checked')?.value || 'skip',
    };

    const data = classify_variant(answers);

    const finalClass = data.final_class;
    const reasonText = data.reason_text;
    const pvs = data.pvs;
    const ps = data.ps;
    const pm = data.pm;
    const pp = data.pp;
    const ba1 = data.ba1;
    const bs = data.bs;
    const bp = data.bp;
    const totalScore = data.total_score;
    const pathStrength = data.total_pathogenic_strength;
    const benignStrength = data.total_benign_strength;
    const reasons = data.reasons || [];

    const badge = document.getElementById('classificationBadge');
    badge.textContent = finalClass;
    badge.setAttribute('data-class', finalClass.replace(/ /g, ''));

    document.getElementById('classificationSubtitle').textContent = reasonText;

    animateCount(document.getElementById('pvsCount'), pvs);
    animateCount(document.getElementById('psCount'), ps);
    animateCount(document.getElementById('pmCount'), pm);
    animateCount(document.getElementById('ppCount'), pp);
    animateCount(document.getElementById('baCount'), ba1);
    animateCount(document.getElementById('bsCount'), bs);
    animateCount(document.getElementById('bpCount'), bp);
    animateCount(document.getElementById('totalScore'), totalScore);

    const maxStrength = Math.max(pathStrength, benignStrength, 1);
    const pathBar = document.getElementById('pathStrengthBar');
    pathBar.querySelector('.bar-text').textContent = `Pathogenic Strength: ${pathStrength}`;
    pathBar.querySelector('.bar-fill').style.width = `${(pathStrength / maxStrength * 100)}%`;

    const benBar = document.getElementById('benStrengthBar');
    benBar.querySelector('.bar-text').textContent = `Benign Strength: ${benignStrength}`;
    benBar.querySelector('.bar-fill').style.width = `${(benignStrength / maxStrength * 100)}%`;

    const criteriaApplied = document.getElementById('criteriaApplied');
    criteriaApplied.innerHTML = '';
    reasons.forEach(({tag, why}) => {
        const li = document.createElement('li');
        li.className = 'evidence-item';
        li.innerHTML = `
            <span class="evidence-tag">${tag}</span>
            <span>${why}</span>
        `;
        criteriaApplied.appendChild(li);
    });

    document.getElementById('literatureSearch').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            window.open(`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(e.target.value)}`, '_blank');
        }
    });

    document.getElementById('formContainer').classList.add('hidden');
    document.getElementById('navigationSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('loadingSpinner').classList.add('hidden');
    document.getElementById('classificationResult').classList.remove('hidden');

    formData.classification = finalClass;
    formData.reasonText = reasonText;
}

/* Reset Tool */
function resetTool() {
    currentStep = 1;
    formData = {
        variant: '',
        condition: '',
        zygosity: '',
        inheritance: '',
        criteria: {},
        flags: {},
        reasons: []
    };

    // Reset form inputs
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.value = '';
        input.classList.remove('invalid');
        document.getElementById(`${input.id}Validation`)?.classList.remove('show');
    });
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
        radio.closest('.radio-option').classList.remove('selected');
    });
    document.querySelectorAll('select').forEach(select => select.value = 'skip');

    // Reset visibility
    document.querySelectorAll('.step-card').forEach(card => card.classList.add('hidden'));
    document.getElementById('step1').classList.remove('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('formContainer').classList.remove('hidden');
    document.getElementById('navigationSection').classList.remove('hidden');

    // Reset conditional sections
    showMissenseSubs(false);
    showNonMissenseAlt(false);
    showAltBasis(false);
    showSegResult(false);
    showDeNovo(false);
    showAf5('skip');
    showRepetitive(false);

    // Reset summary
    updateCriteriaSummary();

    // Update UI
    updateProgress();
    updateStepIndicator();
    updateNavigation();
}