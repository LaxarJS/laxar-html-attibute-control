/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import ng from 'angular';
import 'angular-sanitize';

const axHtmlAttributeName = 'axHtmlAttribute';
const axI18nHtmlAttributeName = 'axI18nHtmlAttribute';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const axHtmlAttributeFactory = [ '$sanitize', 'axI18n', ( $sanitize, i18n ) => {

   /**
    * Allows to put HTML content into arbitrary attributes.
    *
    * Attribute content may not contain HTML tags, but may contain entity references such as `&quot;`
    * or `&nbsp;`.
    */
   return {
      restrict: 'A',
      link: ( scope, element, attrs ) => {

         const postProcess = {};
         postProcess[ axHtmlAttributeName ] = $sanitize;
         postProcess[ axI18nHtmlAttributeName ] = i18nHtml => {
            const locale = scope.i18n.tags[ scope.i18n.locale ];
            if( !locale ) {
               return typeof( i18nHtml ) === 'string' ? i18nHtml : '';
            }
            return $sanitize( i18n.localize( locale, i18nHtml ) );
         };

         function collectionListener( directiveAttributeName ) {
            const process = postProcess[ directiveAttributeName ];
            return ( newValue, oldValue ) => {
               Object.keys( newValue ).forEach( attributeName => {
                  if( newValue[ attributeName ] !== oldValue[ attributeName ] ) {
                     element.attr( attributeName, process( newValue[ attributeName ] ) );
                  }
               } );
               Object.keys( oldValue ).forEach( attributeName => {
                  if( !( attributeName in newValue) ) {
                     element.removeAttr( attributeName );
                  }
               } );
            };
         }

         if( attrs[ axHtmlAttributeName ] ) {
            const updateHtmlAttributes = collectionListener( axHtmlAttributeName );
            scope.$watchCollection( attrs[ axHtmlAttributeName ], updateHtmlAttributes, true );
            updateHtmlAttributes( scope.$eval( attrs[ axHtmlAttributeName ] ), {} );
         }

         if( attrs[ axI18nHtmlAttributeName ] ) {
            const updateI18nHtmlAttributes = collectionListener( axI18nHtmlAttributeName );
            scope.$watchCollection( attrs[ axI18nHtmlAttributeName ], updateI18nHtmlAttributes, true );
            updateI18nHtmlAttributes( scope.$eval( attrs[ axI18nHtmlAttributeName ] ), {} );

            scope.$watch( 'i18n', () => {
               updateI18nHtmlAttributes( scope.$eval( attrs[ axI18nHtmlAttributeName ] ), {} );
            }, true );
         }
      }
   };

} ];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const name = ng.module( 'axHtmlAttributeControl', [] )
   .directive( axHtmlAttributeName, axHtmlAttributeFactory )
   .directive( axI18nHtmlAttributeName, axHtmlAttributeFactory )
   .name;
