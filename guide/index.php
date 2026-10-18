<?php
/** Layout entry point only. No infoblock or catalog requests at this stage. */
require $_SERVER['DOCUMENT_ROOT'] . '/bitrix/header.php';
$APPLICATION->SetTitle('GUIDE — подбор ухода');
$assets = \Bitrix\Main\Page\Asset::getInstance();
// Forum and PT Serif are already loaded by the existing store_custom template.
$assets->addCss('/guide/assets/guide.css');
$assets->addJs('/guide/assets/vendor/gsap.min.js');
$assets->addJs('/guide/assets/guide-motion.js');
$assets->addJs('/guide/assets/guide-data.js');
$assets->addJs('/guide/assets/guide.js');
// Optional normalized payload from the future Bitrix adapter, before this fragment renders.
if (isset($tokatliannGuideData) && is_array($tokatliannGuideData)) {
    echo '<script id="tokatliann-guide-data" type="application/json">';
    echo json_encode($tokatliannGuideData, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);
    echo '</script>';
}
readfile(__DIR__ . '/guide.html');
require $_SERVER['DOCUMENT_ROOT'] . '/bitrix/footer.php';
