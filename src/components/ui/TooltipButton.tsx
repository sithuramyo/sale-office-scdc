import type {ButtonHTMLAttributes} from 'react';import {Icon} from './Icon';
export function TooltipButton({label,icon,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{label:string;icon:string}){return <button {...props} className={'icon-button '+(props.className||'')} aria-label={label} title={label}><Icon name={icon}/><span className="ui-tooltip" role="tooltip">{label}</span></button>}
