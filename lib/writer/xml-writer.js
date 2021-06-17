// Inspired by https://github.com/istanbuljs/istanbuljs/blob/master/packages/istanbul-lib-report/lib/xml-writer.js
// Adapted by stephane.bachelier@gmail.com
const log = require('debug')('report:writer:xml')

const isArray = require('lodash/isArray')
const isFunction = require('lodash/isFunction')
const get = require('lodash/get')

/*
 Copyright 2012-2015, Yahoo Inc.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
const INDENT = '  '

function attrString (attrs) {
  return Object.entries(attrs || {})
    .map(([k, v]) => ` ${k}="${v}"`)
    .join('')
}

/**
 * a utility class to produce well-formed, indented XML
 * @constructor
 */
class XMLWriter {
  constructor () {
    this.headers = [
      '<?xml version="1.0" ?>',
      '<!DOCTYPE coverage SYSTEM "http://cobertura.sourceforge.net/xml/coverage-04.dtd">'
    ]
    this.stack = []
    this.data = []
  }

  indent (str) {
    return this.stack.map(() => INDENT).join('') + str
  }

  /**
   * writes the opening XML tag with the supplied attributes
   * @param {String} name tag name
   * @param {Object} [attrs=null] attrs attributes for the tag
   */
  openTag (name, attrs) {
    const str = this.indent(`<${name + attrString(attrs)}>`)
    log('open tag [%s] %s', name, str)
    this.data.push(str)
    this.stack.push(name)
  }

  visit ($node) {
    if ($node.children && isArray($node.children)) {
      const { node, attributes, children } = $node
      return {
        node,
        attributes,
        children: children.map((child) => this.visit(child))
      }
    }

    if (!isFunction($node.visit)) {
      return $node
    }

    const [{ node, attributes, content }, children] = $node.visit()

    return { node, attributes, content, children }
  }

  appendNode ($node) {
    if (isArray($node)) {
      $node.forEach((child) => {
        this.appendNode(this.visit(child))
      })
      return
    }

    const { node, attributes, content, children } = $node
    log('* append node <%s(%o> with %d children', node, attributes, children ? children.length : 0)

    if (!children) {
      return this.inlineTag(node, attributes, content)
    }

    this.openTag(node, attributes)

    if (isArray(children)) {
      children.forEach((child) => {
        this.appendNode(this.visit(child))
      })
    } else {
      const { node, attributes } = children

      this.openTag(node, attributes)

      get(children, 'children', []).forEach((child) => {
        return this.appendNode(this.visit(child))
      })

      this.closeTag(node)
    }

    this.closeTag(node)
  }

  /**
   * closes an open XML tag.
   * @param {String} name - tag name to close. This must match the writer's
   *  notion of the tag that is currently open.
   */
  closeTag (name) {
    if (this.stack.length === 0) {
      throw new Error(`Attempt to close tag ${name} when not opened`)
    }
    const stashed = this.stack.pop()
    const str = `</${name}>`

    if (stashed !== name) {
      throw new Error(
        `Attempt to close tag ${name} when ${stashed} was the one open`
      )
    }
    log('close tag [%s] %s', name, str)
    this.data.push(this.indent(str))
  }

  /**
   * writes a tag and its value opening and closing it at the same time
   * @param {String} name tag name
   * @param {Object} [attrs=null] attrs tag attributes
   * @param {String} [content=null] content optional tag content
   */
  inlineTag (name, attrs, content) {
    let str = '<' + name + attrString(attrs)
    if (content) {
      str += `>${content}</${name}>`
    } else {
      str += '/>'
    }
    str = this.indent(str)
    this.data.push(str)
    log('inline tag', str)
  }

  /**
   * closes all open tags and ends the document
   */
  closeAll () {
    this.stack
      .slice()
      .reverse()
      .forEach((name) => {
        this.closeTag(name)
      })
  }

  toString () {
    return this.headers.concat(this.data).join('\n')
  }
}

module.exports = XMLWriter
