# Design System Document: The Editorial Ledger
 
## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"Check Splitters."** In the world of bill-splitting, we move away from the cluttered anxiety of spreadsheets and toward the refined clarity of a premium editorial magazine. 
 
We break the "standard app" mold by rejecting the grid-locked, boxed-in layouts common in fintech. Instead, we utilize **Intentional Asymmetry** and **Tonal Depth**. By overlapping elements and using generous white space, we create a rhythmic flow that feels human and approachable. This system is designed to be "invisible yet felt"—a professional tool that feels like a high-end concierge service.
 
## 2. Colors & Surface Philosophy
The palette is rooted in a sophisticated interplay of light neutrals and a signature deep teal (`primary: #00685f`). 
 
### The "No-Line" Rule
To achieve a premium, custom feel, **1px solid borders are strictly prohibited for sectioning.** We do not use lines to separate content. Instead, boundaries are defined through:
*   **Background Shifts:** Using `surface-container-low` against a `surface` background.
*   **Negative Space:** Using the spacing scale to create "implied" containers.
 
### Surface Hierarchy & Nesting
Think of the UI as physical sheets of fine paper stacked atop one another. 
*   **Base Layer:** `surface` (#f7f9fb)
*   **Secondary Content:** `surface-container-low` (#f2f4f6)
*   **Floating/Active Elements:** `surface-container-lowest` (#ffffff)
*   **Deep Contrast:** Use `surface-container-highest` (#e0e3e5) for subtle inset areas like search bars or code blocks.
 
### The "Glass & Gradient" Rule
To add "soul" to the minimalism, primary CTAs and hero headers should utilize a subtle linear gradient transitioning from `primary` (#00685f) to `primary_container` (#008378). For floating modal overlays, use **Glassmorphism**: apply a semi-transparent `surface` color with a 20px-30px backdrop-blur to allow underlying content colors to bleed through softly.
 
## 3. Typography
The typography system uses a dual-font approach to balance editorial authority with functional precision.
 
*   **Display & Headlines (Manrope):** This is our "Editorial" voice. Manrope provides a geometric, modern feel. Use `display-lg` and `headline-md` with tight letter-spacing (-2%) to create a bold, confident hierarchy for totals and bill names.
*   **Body & Labels (Inter):** This is our "Functional" voice. Inter is chosen for its exceptional legibility in small sizes and number clarity. `body-md` is the workhorse for line items and receipts.
*   **Number Clarity:** Always use `title-lg` for currency amounts to ensure they are the most legible element on the screen.
 
## 4. Elevation & Depth
We eschew traditional "drop shadows" in favor of **Tonal Layering**.
 
*   **The Layering Principle:** Depth is achieved by "stacking." For instance, a `surface-container-lowest` card placed on a `surface-container-low` background creates a natural, soft lift.
*   **Ambient Shadows:** Where a floating effect is vital (e.g., a Bottom Sheet), use a shadow with a blur of 40px, 0% spread, and 6% opacity using a tint of the `on-surface` color (#191c1e). It should look like a soft glow, not a dark smudge.
*   **The Ghost Border Fallback:** If a container lacks sufficient contrast, use a **Ghost Border**: `outline-variant` (#bcc9c6) at 15% opacity. This provides a "suggestion" of a boundary without the harshness of a solid line.
 
## 5. Components
 
### Buttons
*   **Primary:** High-pill shape (`rounded-full`), using the signature gradient (`primary` to `primary_container`). Text is `on-primary` (#ffffff).
*   **Secondary:** No background. Use `primary` text with a `Ghost Border`.
*   **Tertiary:** No background, no border. Use `on-surface-variant` text for low-priority actions.
 
### Cards & Receipt Lists
*   **The "No-Divider" Rule:** Forbid the use of horizontal lines between receipt items. Instead, use `surface-container-low` for every second item (zebra striping) or simply utilize vertical spacing (1.5rem) to separate entries.
*   **Structure:** Use `title-md` for the item name and `body-lg` (Inter) for the price, right-aligned to create a clean vertical axis of numbers.
 
### Inputs
*   **Style:** Minimalist. No bottom line or box border. Use a `surface-container-highest` background with `rounded-md` (0.75rem).
*   **Focus State:** Transition the background to `primary_container` at 10% opacity and apply a `Ghost Border` using the full-opacity `primary` color.
 
### Signature Component: The "Split Chip"
For assigning costs, use `rounded-xl` chips. When a person is selected, the chip transforms from `surface-container-high` to the `primary` color with a subtle inner glow (10% white) to show it is "active."
 
## 6. Do’s and Don’ts
 
### Do:
*   **Use Asymmetry:** Place a large `display-sm` total in the top left, but place the "Add Item" button in the bottom right to create visual tension and interest.
*   **Respect the "Breath":** Give every card at least 24px (`xl` spacing) of internal padding.
*   **Tint Your Neutrals:** Always use the `surface` tokens provided; never use pure `#FFFFFF` for backgrounds, as it causes eye strain in high-contrast environments.
 
### Don’t:
*   **No Boxes-in-Boxes:** Avoid nesting a card inside another card with the same background color. Always shift the tonal tier (e.g., Lowest on Low).
*   **No Sharp Corners:** Use the `roundedness` scale religiously. Receipt items should be `md`, while main action containers should be `xl`.
*   **No Default Shadows:** Never use a standard `0px 2px 4px rgba(0,0,0,0.5)` shadow. It kills the premium editorial feel.

