<?php

/*
 * BikeIT
 * One content
 * Center institutional content, menus and taxonomies to first site.
 * Disable these editions for other sites
 */

class BikeIT_OneContent {

  function __construct() {

    if(is_multisite()) {
      add_action( 'init', array($this, 'change_tax_terms_table'), 0 );
      add_action( 'switch_blog', array($this, 'change_tax_terms_table'), 0 );

      // add_action( 'dynamic_sidebar_before', array($this, 'change_options_table'), 0 );
      // add_action( 'dynamic_sidebar_after', array($this, 'restore_options_table'), 0 );
    }

  }

  function get_base_prefix() {
    global $wpdb;
    return apply_filters('bikeit_onecontent_base_prefix', $wpdb->base_prefix);
  }

  function change_tax_terms_table() {
    global $wpdb;
    $prefix = $this->get_base_prefix();
    $wpdb->terms = $prefix . 'terms';
    $wpdb->term_taxonomy = $prefix . 'term_taxonomy';
  }

  function change_options_table() {
    global $wpdb, $wp_registered_widgets;
    $prefix = $this->get_base_prefix();
    $this->original_widgets = $wp_register_widgets;
    $this->original_options = $wpdb->options;
    $wpdb->options = $prefix . 'options';
  }

  function restore_options_table() {
    global $wpdb;
    $prefix = $this->get_base_prefix();
    $wpdb->options = $this->original_options;
  }

}

new BikeIT_OneContent();
