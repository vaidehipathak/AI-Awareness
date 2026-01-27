import os
import re
import random
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors

class TemplateEngine:
    def __init__(self, c, width, height):
        self.c = c
        self.width = width
        self.height = height

    def hex_to_rgb(self, hex_code):
        hex_code = hex_code.lstrip('#')
        try:
            return tuple(int(hex_code[i:i+2], 16)/255.0 for i in (0, 2, 4))
        except:
            return (0.5, 0.5, 0.5)

    def draw_dynamic_logo(self, x, y, concept, color_rgb):
        self.c.saveState()
        self.c.translate(x, y)
        self.c.setFillColorRGB(*color_rgb)
        
        concept = concept.lower()
        if "star" in concept:
            p = self.c.beginPath()
            p.moveTo(20, 40)
            p.lineTo(25, 25); p.lineTo(40, 25); p.lineTo(28, 15)
            p.lineTo(32, 0); p.lineTo(20, 10); p.lineTo(8, 0)
            p.lineTo(12, 15); p.lineTo(0, 25); p.lineTo(15, 25)
            p.close()
            self.c.drawPath(p, fill=1, stroke=0)
        elif "shield" in concept:
            p = self.c.beginPath()
            p.moveTo(0, 30); p.lineTo(20, 0); p.lineTo(40, 30); p.lineTo(20, 40); p.close()
            self.c.drawPath(p, fill=1, stroke=0)
        elif "pillar" in concept or "bank" in concept:
            self.c.rect(0, 0, 40, 5, fill=1, stroke=0)
            self.c.rect(5, 5, 5, 20, fill=1, stroke=0)
            self.c.rect(18, 5, 5, 20, fill=1, stroke=0)
            self.c.rect(30, 5, 5, 20, fill=1, stroke=0)
            p = self.c.beginPath()
            p.moveTo(0, 25); p.lineTo(20, 40); p.lineTo(40, 25); p.close()
            self.c.drawPath(p, fill=1, stroke=0)
        else:
            self.c.circle(20, 20, 20, fill=1, stroke=0)
            self.c.setFillColor(colors.white)
            self.c.setFont("Helvetica-Bold", 20)
            self.c.drawCentredString(20, 13, concept[0].upper() if concept else "Z")
            
        self.c.restoreState()

    def draw_stamp(self, text, x, y, rotation=30):
        self.c.saveState()
        self.c.translate(x, y)
        self.c.rotate(rotation)
        self.c.setStrokeColorRGB(0.8, 0, 0)
        self.c.setFillColorRGB(0.8, 0, 0)
        self.c.setLineWidth(3)
        width = self.c.stringWidth(text, "Helvetica-Bold", 20) + 20
        height = 30
        self.c.roundRect(-5, -5, width+10, height+10, 4, stroke=1, fill=0)
        self.c.roundRect(-2, -2, width+4, height+4, 2, stroke=1, fill=0) 
        self.c.setFont("Helvetica-Bold", 20)
        self.c.drawString(5, 5, text)
        self.c.restoreState()

    def draw_barcode(self, x, y):
        self.c.saveState()
        self.c.translate(x, y)
        self.c.setFillColor(colors.black)
        for i in range(0, 100, 2):
            w = random.choice([0.5, 1, 2])
            self.c.rect(i, 0, w, 15, fill=1, stroke=0)
        self.c.restoreState()

    def draw_indian_emblem(self, x, y, scale=1.0):
        self.c.saveState()
        self.c.translate(x, y)
        self.c.scale(scale, scale)
        self.c.setFillColor(colors.black)
        self.c.rect(-10, 0, 20, 5, fill=1, stroke=0)
        self.c.circle(0, 15, 8, fill=1, stroke=0) 
        self.c.rect(-5, 5, 10, 10, fill=1, stroke=0) 
        self.c.circle(-12, 12, 6, fill=1, stroke=0)
        self.c.rect(-15, 5, 8, 8, fill=1, stroke=0)
        self.c.circle(12, 12, 6, fill=1, stroke=0)
        self.c.rect(7, 5, 8, 8, fill=1, stroke=0)
        self.c.restoreState()

    # --- DOMAIN STYLES ---

    def apply_dynamic_style(self, profile, custom_title=None):
        primary_hex = profile.get("primary_color_hex", "#000000")
        secondary_hex = profile.get("secondary_color_hex", "#E0E0E0")
        logo_concept = profile.get("logo_concept", "shield")
        
        # Header Text Logic
        header_text = custom_title if custom_title else "STATEMENT OF RECORD"
        
        pri_rgb = self.hex_to_rgb(primary_hex)
        sec_rgb = self.hex_to_rgb(secondary_hex)
        bg_rgb = tuple(min(1.0, c + 0.9) for c in sec_rgb) 
        self.c.setFillColorRGB(*bg_rgb)
        self.c.rect(0, 0, self.width, self.height, fill=1)
        
        # Add prominent watermark for legal protection
        self.c.saveState()
        self.c.setFont("Helvetica-Bold", 80)
        self.c.setFillColorRGB(0.9, 0.9, 0.9)  # Light gray
        self.c.translate(self.width/2, self.height/2)
        self.c.rotate(45)
        self.c.drawCentredString(0, 0, "SYNTHETIC")
        self.c.drawCentredString(0, -100, "EDUCATIONAL USE ONLY")
        self.c.restoreState()
        
        self.c.setFillColorRGB(*pri_rgb)
        self.c.rect(0, self.height-80, self.width, 10, fill=1, stroke=0) 
        self.c.rect(0, 20, self.width, 10, fill=1, stroke=0)
        self.draw_dynamic_logo(40, self.height-70, logo_concept, pri_rgb)
        self.c.setFillColor(colors.black)
        self.c.setFont("Helvetica-Bold", 24)
        self.c.drawString(90, self.height-55, header_text)
        
        # Updated stamp with legal disclaimer
        self.draw_stamp("Z-KATT CONFIDENTIAL", self.width-280, self.height-120, rotation=-12)
        
        # Add disclaimer text below stamp
        self.c.saveState()
        self.c.setFont("Helvetica", 8)
        self.c.setFillColorRGB(0.8, 0, 0)
        self.c.translate(self.width-280, self.height-150)
        self.c.rotate(-12)
        self.c.drawString(0, 0, "DO NOT SHARE OR USE")
        self.c.drawString(0, -10, "FOR PERSONAL PURPOSES")
        self.c.restoreState()

    # Legacy fallbacks for non-dynamic domains
    def draw_logo(self, x, y, type="generic"):
        self.draw_dynamic_logo(x, y, "shield", (0.5, 0.5, 0.5))
    
    def apply_medical_style(self):
        self.apply_dynamic_style({"primary_color_hex": "#0088CC", "secondary_color_hex": "#E0FFFF", "logo_concept": "cross"}, "MEDICAL RECORD")
    def apply_financial_style(self):
        self.apply_dynamic_style({"primary_color_hex": "#004400", "secondary_color_hex": "#EEFFEE", "logo_concept": "pillar"}, "FINANCIAL STATEMENT")
    def apply_legal_style(self):
        self.apply_dynamic_style({"primary_color_hex": "#000000", "secondary_color_hex": "#FFFFFF", "logo_concept": "shield"}, "LEGAL AGREEMENT")
    def apply_generic_style(self):
        self.apply_dynamic_style({"primary_color_hex": "#333333", "secondary_color_hex": "#EEEEEE", "logo_concept": "shield"}, "STATEMENT")

def clean_llm_output(text):
    # Remove markdown code blocks
    text = re.sub(r"```[a-zA-Z]*", "", text)
    text = text.replace("```", "")
    
    # Remove markdown links but keep text: [text](url) -> text
    text = re.sub(r"\[(.*?)\]\(.*?\)", r"\1", text)
    
    # Remove standalone artifacts like (http...), (mailto:...), (#)
    text = re.sub(r"\(http.*?\)", "", text)
    text = re.sub(r"\(mailto:.*?\)", "", text)
    text = re.sub(r"\(tel:.*?\)", "", text)
    text = re.sub(r"\(\#\)", "", text) # Remove (#) anchor artifacts
    
    # Clean bracketed instructions [Logo]
    text = re.sub(r"\[.*?\]", "", text)
    
    return text.strip()

def render_to_pdf(content, filename_prefix="synthetic_doc", intent_profile=None):
    from django.conf import settings
    output_dir = os.path.join(settings.MEDIA_ROOT, "zkatt")
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, f"{filename_prefix}.pdf")
    
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter
    template = TemplateEngine(c, width, height)
    
    branding = intent_profile.get("branding_profile", {}) if intent_profile else {}
    domain = "generic"

    # Use ONLY the synthetic_entity_name from LLM - NO hardcoded entity checks
    if branding and branding.get("primary_color_hex", "#000000") != "#000000": 
        # Get the synthetic (legally-safe) entity name from LLM
        entity_name = intent_profile.get("synthetic_entity_name", "")
        
        # Fallback if LLM didn't provide synthetic name
        if not entity_name or len(entity_name) < 3:
            entity_name = intent_profile.get("document_domain", "Statement").title()
            if "Bank" not in entity_name and "Statement" not in entity_name:
                entity_name += " Statement"
             
        template.apply_dynamic_style(branding, custom_title=entity_name)
        domain = "dynamic_" + branding.get("logo_concept", "custom")
    else:
        # Fallback to generic domain templates
        doc_domain = intent_profile.get("document_domain", "generic").lower() if intent_profile else "generic"
        if "medical" in doc_domain: template.apply_medical_style()
        elif "financial" in doc_domain: template.apply_financial_style()
        elif "legal" in doc_domain: template.apply_legal_style()
        else: template.apply_generic_style()

    # --- HELPER FUNCTIONS ---
    
    def draw_rich_text(font_canvas, start_x, start_y, text_line):
        parts = text_line.split("**")
        current_x = start_x
        for i, part in enumerate(parts):
            if not part: continue
            is_bold = (i % 2 == 1) 
            font_name = "Helvetica-Bold" if is_bold else "Times-Roman"
            font_canvas.setFont(font_name, 11)
            font_canvas.drawString(current_x, start_y, part)
            current_x += font_canvas.stringWidth(part, font_name, 11)
        return current_x

    def render_table(table_lines, start_y):
        if not table_lines: return start_y
        rows = []
        for l in table_lines:
            l_clean = l.strip('|').strip()
            cells = [cell.strip() for cell in l_clean.split('|')]
            rows.append(cells)
        if not rows: return start_y
        
        num_cols = len(rows[0])
        safe_width = width - 120
        col_width = safe_width / num_cols
        row_height = 20
        current_t_y = start_y
        
        for r_idx, row in enumerate(rows):
            if current_t_y < 80:
                c.showPage()
                current_t_y = height - 60
                c.setFont("Times-Roman", 11)
                
            if r_idx == 0:
                c.setFillColorRGB(0.92, 0.92, 0.96)
                c.rect(60, current_t_y - 12, safe_width, row_height, fill=1, stroke=0)
                c.setFillColor(colors.black)
                c.setFont("Helvetica-Bold", 10)
            else:
                c.setFont("Times-Roman", 10)

            x_pos = 60
            for cell in row:
                c.drawString(x_pos + 4, current_t_y - 8, cell)
                c.setStrokeColor(colors.grey)
                c.setLineWidth(0.5)
                c.line(x_pos + col_width, current_t_y + 8, x_pos + col_width, current_t_y - 12)
                x_pos += col_width
                
            c.line(60, current_t_y - 12, 60 + safe_width, current_t_y - 12)
            c.line(60, current_t_y + 8, 60, current_t_y - 12)
            current_t_y -= row_height
            
        return current_t_y - 10

    # --- MAIN RENDER LOOP ---
    clean_content = clean_llm_output(content)
    y_cursor = height - 120
    margin_left = 60
    
    lines = clean_content.split('\n')
    table_buffer = []
    in_table = False
    
    for line in lines:
        line = line.strip()
        
        # Check for artifacts to SKIP
        if re.match(r'^[-=_*]{3,}$', line): # Skips ===, ---, ***
            continue
        
        if y_cursor < 80 and not in_table:
            c.showPage()
            y_cursor = height - 60
            
        if line.startswith("|") or ("|" in line and line.count("|") > 1):
            if "---" in line: continue 
            table_buffer.append(line)
            in_table = True
            continue
        elif in_table:
            y_cursor = render_table(table_buffer, y_cursor)
            table_buffer = []
            in_table = False
            
        if not line:
            y_cursor -= 5
            continue
            
        if line.lower().startswith("table") and ":" in line:
            c.setFont("Helvetica-Bold", 12)
            c.setFillColor(colors.black)
            c.drawString(margin_left, y_cursor, line)
            y_cursor -= 14
            continue
            
        # Default Line
        c.setFillColor(colors.black)
        draw_rich_text(c, margin_left, y_cursor, line)
        y_cursor -= 14
        
    if in_table and table_buffer:
        y_cursor = render_table(table_buffer, y_cursor)

    # Footer
    template.draw_barcode(width/2 - 50, 30)
    c.setFont("Helvetica", 6)
    c.setFillColor(colors.black)
    c.drawCentredString(width/2, 10, f"Generated by Z-KATT | Mode: {domain.upper()}")

    c.save()
    print(f"Document rendered to: {filepath}")
    return f"/media/zkatt/{filename_prefix}.pdf"
