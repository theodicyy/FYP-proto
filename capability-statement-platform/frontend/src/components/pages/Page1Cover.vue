<template>
  <div id="page-1-cover" class="page-1-cover">
    <!-- Top-Left Logo -->
    <div class="page-1-logo-top">
      <img 
        :src="partnershipLogo" 
        alt="Wong Partnership Logo" 
        class="page-1-logo-image"
      />
    </div>

    <!-- Primary Visual - Large W Graphic -->
    <div class="page-1-w-graphic">
      <img 
        :src="wLogo" 
        alt="W Graphic" 
        class="page-1-w-image"
      />
    </div>

    <!-- Title Section -->
    <div class="page-1-title-section">
      <h1 class="page-1-title">{{ title || 'PROPOSAL FOR [INSERT CLIENT NAME]' }}</h1>
      <p class="page-1-date">{{ date || 'INSERT DATE [DDMonthYYYY]' }}</p>
    </div>

    <!-- Footer Section -->
    <div class="page-1-footer">
      <div class="page-1-footer-left">
        {{ footerLeft || 'ASEAN | CHINA | MIDDLE EAST' }}
      </div>
      <div class="page-1-footer-right">
        <img 
          :src="partnershipLogo" 
          alt="Wong Partnership Logo" 
          class="page-1-footer-logo"
        />
        <p class="page-1-footer-subtext">{{ footerSubtext || 'a regional law network' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import partnershipLogo from '../../images/template/Wong_Partnership_Logo_HD_Transparent.png'
import wLogo from '../../images/template/WongP_W_Logo_HD_Transparent.png'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: ''
  },
  footerLeft: {
    type: String,
    default: ''
  },
  footerSubtext: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
/* Page 1 Cover - A4 Dimensions */
.page-1-cover {
  width: 210mm;
  min-height: 297mm;
  background-color: #ffffff;
  position: relative;
  margin: 0;
  padding: 25mm;
  box-sizing: border-box;
  overflow: hidden;
  page-break-after: always;
}

/* Top-Left Logo */
.page-1-logo-top {
  position: absolute;
  top: 25mm;
  left: 25mm;
  max-width: 120mm;
}

.page-1-logo-image {
  max-width: 120mm;
  height: auto;
  display: block;
  object-fit: contain;
}

/* Primary Visual - Large W Graphic */
.page-1-w-graphic {
  position: absolute;
  top: 140mm;
  left: 30mm;
  width: 160mm;
  height: 120mm;
  z-index: 1;
}

.page-1-w-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Title Section */
.page-1-title-section {
  position: absolute;
  top: 240mm;
  left: 35mm;
  z-index: 2;
}

.page-1-title {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 32pt;
  font-weight: 600;
  color: #008080;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0;
  padding: 0;
  line-height: 1.2;
  white-space: nowrap;
}

.page-1-date {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 14pt;
  font-weight: 400;
  color: #555555;
  margin: 0;
  margin-top: 12mm;
  padding: 0;
  line-height: 1.4;
}

/* Footer Section */
.page-1-footer {
  position: absolute;
  bottom: 25mm;
  left: 25mm;
  right: 25mm;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.page-1-footer-left {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 9pt;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.page-1-footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.page-1-footer-logo {
  max-width: 80mm;
  height: auto;
  display: block;
  object-fit: contain;
  margin-bottom: 3mm;
}

.page-1-footer-subtext {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-size: 8pt;
  color: #666666;
  margin: 0;
  padding: 0;
}

/* Print Styles */
@media print {
  .page-1-cover {
    margin: 0;
    padding: 25mm;
    box-shadow: none;
  }
}
</style>
