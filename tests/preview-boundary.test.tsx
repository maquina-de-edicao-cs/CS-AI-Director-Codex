// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PreviewBoundary } from '../apps/web/src/PreviewBoundary'

function BrokenPreview(): never { throw new Error('Falha no contexto WebGL') }

it('troca uma prévia que falhou por orientação textual', () => {
  const log=vi.spyOn(console,'error').mockImplementation(()=>{})
  try {
    render(<PreviewBoundary><BrokenPreview/></PreviewBoundary>)
    expect(screen.getByText('Prévia 3D indisponível neste navegador')).toBeTruthy()
  } finally {log.mockRestore()}
})
