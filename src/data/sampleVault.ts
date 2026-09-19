export interface SampleFileDef {
  name: string;
  content: string;
}

export const SAMPLE_VAULT_FILES: SampleFileDef[] = [
  {
    name: '01 - Quantum Computing Fundamentals',
    content: `---
title: Quantum Computing Fundamentals
tags: [quantum, physics, computation]
date: 2026-09-19
status: in-progress
---

# Quantum Computing Fundamentals

Quantum computation utilizes quantum mechanical phenomena such as **superposition** and **entanglement** to perform computations intractable for classical Turing architectures.

> [!NOTE] Fundamental Postulate
> Unlike a classical bit which is strictly $0$ or $1$, a quantum bit or *qubit* can exist in an arbitrary linear combination of basis states:
> $$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle$$
> where $\\alpha, \\beta \\in \\mathbb{C}$ satisfy the normalization condition $|\\alpha|^2 + |\\beta|^2 = 1$.

## State Space and the Bloch Sphere

Every pure single-qubit state can be mapped to a point on the surface of the unit three-sphere known as the **Bloch Sphere**. Parameterized in spherical coordinates:

$$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$$

Here, $\\theta \\in [0, \\pi]$ corresponds to the polar angle, while $\\phi \\in [0, 2\\pi)$ denotes the azimuthal relative phase.

> [!TIP] Geometric Intuition
> State vectors on opposite poles of the Bloch sphere represent orthogonal computational states, whereas orthogonal spatial vectors on the sphere correspond to states with overlap $|\\langle\\psi|\\phi\\rangle|^2 = 1/2$.

### Single Qubit Quantum Logic Gates

Standard quantum gates are represented by $2 \\times 2$ unitary operators $U^\\dagger U = I$. The fundamental Pauli operators are:

$$\\sigma_x = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad \\sigma_y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}, \\quad \\sigma_z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$$

The **Hadamard transform** $H$ maps the computational basis into equal superpositions:

$$H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$$

Applying $H$ to ground state $|0\\rangle$:
$$H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} = |+\\rangle$$

## Entanglement and Bell States

When two qubits interact, they can form non-separable tensor product states. The canonical maximally entangled Bell state $|\\Phi^+\\rangle$ is defined as:

$$|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$$

Measuring the first qubit immediately projects the second qubit into the identical eigenstate regardless of spatial separation.

==Quantum teleportation== leverages pre-shared Bell pairs and two classical bits of communication to transfer an arbitrary unknown state $|\\psi\\rangle$ with unit fidelity.

See practical benchmarks in [[02 - Algorithm Benchmarks|Algorithm Benchmarks]] and review our physical realization plans in [[03 - Hardware Roadmap#Superconducting Transmon Architecture|Hardware Roadmap > Transmons]].

### Simulation Script Example

\`\`\`python
import numpy as np

# Define Pauli matrices
I = np.eye(2, dtype=complex)
X = np.array([[0, 1], [1, 0]], dtype=complex)
H = (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=complex)

# Create ground state |0>
psi_0 = np.array([[1], [0]], dtype=complex)

# Apply Hadamard gate
psi_plus = H @ psi_0
print("Superposition State (|0> + |1>)/sqrt(2):")
print(psi_plus)
\`\`\`

#quantum #physics #algorithms

# Backlinks
- [[Project Index]]
- [[Daily Notes/2026-09-15]]
`,
  },
  {
    name: '02 - Algorithm Benchmarks',
    content: `---
title: Algorithm Benchmarks
tags: [algorithms, grover, shor, complexity]
---

# Quantum Algorithm Performance Benchmarks

This document compares empirical and theoretical asymptotic complexity boundaries across prominent quantum algorithms versus their best-known classical counterparts.

> [!WARNING] Coherence Window Limit
> Current Noisy Intermediate-Scale Quantum (NISQ) devices suffer from limited $T_1$ (energy relaxation) and $T_2^*$ (dephasing) timescales. Circuit depth must not exceed the coherence envelope without quantum error mitigation (QEM).

## Asymptotic Complexity Matrix

| Algorithm | Classical Complexity | Quantum Complexity | Speedup Class | Target Domain |
| :--- | :--- | :--- | :--- | :--- |
| **Grover Search** | $\\mathcal{O}(N)$ | $\\mathcal{O}(\\sqrt{N})$ | Quadratic | Unstructured database search |
| **Shor Factorization** | $\\mathcal{O}(\\exp(c \\sqrt[3]{n \\log^2 n}))$ | $\\mathcal{O}(n^3)$ | Exponential | RSA Cryptanalysis |
| **HHL Matrix Inversion** | $\\mathcal{O}(N \\kappa)$ | $\\mathcal{O}(\\log(N) s^2 \\kappa^2 / \\epsilon)$ | Exponential | Quantum Machine Learning |
| **VQE (Molecular)** | Non-polynomial exact CI | Polynomial sampling | Heuristic | Electronic ground state estimation |

## Grover's Search Derivation

Grover's algorithm employs iterative rotations in a two-dimensional subspace spanned by the target state $|w\\rangle$ and the uniform superposition $|s\\rangle$:

$$|s\\rangle = \\frac{1}{\\sqrt{N}}\\sum_{x=0}^{N-1}|x\\rangle$$

Each Grover diffusion operator step comprises:

$$G = (2|s\\rangle\\langle s| - I) R_w$$

Where $R_w = I - 2|w\\rangle\\langle w|$ flips the sign of the target marked state. The optimal number of query oracle evaluations is given by:

$$R \\approx \\frac{\\pi}{4}\\sqrt{N}$$

> [!SUCCESS] Experimental Verification
> 5-qubit Grover iteration was validated on IBM Eagle processor with $94.2\\%$ target retrieval fidelity after $10,000$ calibration shots.

## Qiskit Implementation Checklist

- [x] Implement quantum Fourier transform (QFT) module
- [x] Configure zero-noise extrapolation (ZNE) error mitigation
- [x] Execute Phase Estimation test on simulator
- [ ] Run benchmark on superconducting hardware (Refer to [[03 - Hardware Roadmap|Hardware Roadmap]])
- [ ] Profile gate execution latency for two-qubit CZ gates

Refer back to theory in [[01 - Quantum Computing Fundamentals|Fundamentals]].

#benchmarks #grover #vqe
`,
  },
  {
    name: '03 - Hardware Roadmap',
    content: `---
title: Hardware Roadmap & Physical Modalities
tags: [hardware, qubits, ion-trap, transmon, cryogenics]
---

# Hardware Roadmap & Physical Modalities

Realizing fault-tolerant universal quantum computation requires building physical systems with high gate fidelities exceeding the surface code threshold ($\\sim 99.0\\%$).

## Superconducting Transmon Architecture

Transmons are non-linear LC oscillators where the Josephson junction acts as a non-dissipative non-linear inductor:

$$H = 4E_C (n - n_g)^2 - E_J \\cos(\\phi)$$

The anharmonicity $\\alpha = E_{12} - E_{01} \\approx -E_C$ enables isolated microwave addressing of the computational subspace $\{|0\\rangle, |1\\rangle\}$ without leakage to higher excited states $|2\\rangle$.

> [!CAUTION] Cryogenic Thermal Budget
> Dilution refrigerators must sustain base temperatures under $15\\text{ mK}$ at the mixing chamber stage. Passive coaxial line attenuation and infrared shielding are critical to minimize stray blackbody photons.

### Phase Noise and Coupling Strategies

Modern superconducting circuits employ tunable couplers to extinguish residual $ZZ$-crosstalk:

$$\\zeta_{ZZ} = \\omega_{11} - \\omega_{10} - \\omega_{01} + \\omega_{00} \\approx 0$$

## Trapped Ion Technology

Trapped ion systems confine singly ionized atoms (Yb-171 or Ca-40) inside radio-frequency Paul traps.

- **Fidelity advantage:** Identical natural atoms with identical resonant optical frequencies.
- **Connectivity:** All-to-all Coulomb bus mediated motional coupling.
- **Challenge:** Slower gate speed ($\sim 10-100\\,\\mu\\text{s}$) compared to superconducting transmons ($\sim 20-50\\,\\text{ns}$).

> [!EXAMPLE] Multi-Modal Comparison
> Read [[01 - Quantum Computing Fundamentals#Entanglement and Bell States|Entanglement Principles]] to understand why motional phononic modes enable all-to-all connectivity in linear ion chains.

## Key Milestone Timeline

1. **Q1 2026:** Surface code distance-3 memory logical qubit demonstration.
2. **Q3 2026:** Mid-circuit measurement with dynamic feedforward active reset.
3. **Q4 2026:** Integration of photonic interconnects across modular cryostats.

### Microwave Readout & Radar Link Budget

Signal reception and microwave scatter modeling use the radar range equation for scattered pulse power:

$$P_r = \\frac{P_t G^2 \\lambda^2 \\sigma}{(4\\pi)^3 R^4 L_s}$$

Where $P_t$ is transmitted power, $G$ antenna gain, $\\lambda$ wavelength, $\\sigma$ radar cross section, $R$ range distance, and $L_s$ system losses.

#hardware #roadmap #transmons #ions
`,
  },
];
