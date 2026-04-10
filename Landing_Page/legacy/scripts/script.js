document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Intersection Observer for scroll animations (fade-in) ---
    const faders = document.querySelectorAll('.fade-in');
    
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // Run once on load for elements already in view
    setTimeout(() => {
        faders.forEach(fader => {
            const rect = fader.getBoundingClientRect();
            if(rect.top < window.innerHeight) fader.classList.add('visible');
        });
    }, 100);
});

// --- 2. Mini Demo Preview Logic ---
function runMiniDemo() {
    const weightInput = document.getElementById('demo-weight').value;
    const heightInput = document.getElementById('demo-height').value;
    const mood = document.getElementById('demo-mood').value;

    const placeholder = document.getElementById('output-placeholder');
    const resultDiv = document.getElementById('output-result');
    
    const resBmi = document.getElementById('res-bmi');
    const resText = document.getElementById('res-text');

    // Validation
    if(!weightInput || !heightInput) {
        alert("Please enter both weight and height to see the preview.");
        return;
    }

    // Hide placeholder
    placeholder.style.display = 'none';
    resultDiv.style.display = 'block';
    
    // Calculate simulated BMI
    const weight = parseFloat(weightInput);
    const heightM = parseFloat(heightInput) / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    
    resBmi.innerText = bmi;

    // AI logic mockup
    let suggestion = "";
    
    if(mood === "Tired") {
        suggestion = "We suggest a B12 fortified matcha bowl and complex carbs to restore energy levels, customized to your caloric band.";
    } else if (mood === "Stressed") {
        suggestion = "We prescribe a magnesium-rich dark leafy green mix and soothing herbal infusions to decrease cortisol spikes.";
    } else {
        suggestion = "We prescribe a balanced high-protein lean meal to optimize your active cognitive performance.";
    }

    resText.innerText = suggestion;

    // Animate glow to show it updated
    const mockCard = document.querySelector('.mock-card');
    mockCard.style.boxShadow = "0 0 20px rgba(188, 143, 143, 0.5)";
    setTimeout(() => {
        mockCard.style.boxShadow = "none";
    }, 1000);
}
