/**
 * Get the closest matching element up the DOM tree.
 * @private
 * @param  {Element} elem     Starting element
 * @param  {String}  selector Selector to match against
 * @return {Boolean|Element}  Returns null if not match found
 */
export function closest( elem, selector ) {

    var elementProto = Object.getPrototypeOf(elem);

    // Element.matches() polyfill
    if (!elementProto.matches) {
        elementProto.matches =
            elementProto.matchesSelector ||
            elementProto.mozMatchesSelector ||
            elementProto.msMatchesSelector ||
            elementProto.oMatchesSelector ||
            elementProto.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
    }

    // Get closest match
    for ( ; elem && elem.matches; elem = elem.parentNode ) {
        if ( elem.matches( selector ) ) return elem;
    }

    return null;

};