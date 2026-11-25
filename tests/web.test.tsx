// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../apps/web/src/App'
import { useDirectorStore } from '../apps/web/src/store'

afterEach(() => { cleanup(); useDirectorStore.getState().reset() })

it('mantém o editor disponível quando WebGL não consegue criar contexto', () => {
  const previous=window.WebGLRenderingContext
  Object.defineProperty(window,'WebGLRenderingContext',{configurable:true,value:class {}})
  const context=vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(null)
  try {
    render(<App />)
    expect(screen.getByText('Prévia 3D indisponível neste navegador')).toBeTruthy()
    expect(screen.getByRole('textbox',{name:/Prompt gerado/i})).toBeTruthy()
  } finally {
    context.mockRestore()
    Object.defineProperty(window,'WebGLRenderingContext',{configurable:true,value:previous})
  }
})

it('seleciona comando, altera parâmetro e atualiza o prompt', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: /Aproximar câmera/i }))
  const editor = screen.getByRole('region', { name: /Parâmetros/i })
  await user.clear(within(editor).getByLabelText(/Distância/i))
  await user.type(within(editor).getByLabelText(/Distância/i), '1')
  expect((screen.getByRole('textbox', { name: /Prompt gerado/i }) as HTMLTextAreaElement).value).toContain('Aproximar câmera: 1 m')
})

it('inclui a descrição visual escrita pelo usuário no prompt', async () => {
  const user=userEvent.setup()
  render(<App />)
  await user.type(screen.getByRole('textbox',{name:/Descrição da cena/i}),'Palco iluminado')
  expect((screen.getByRole('textbox',{name:/Prompt gerado/i}) as HTMLTextAreaElement).value).toContain('Palco iluminado')
})

it('impede exportar um projeto com parâmetro inválido', async () => {
  const user=userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button',{name:/Aproximar câmera/i}))
  const editor=screen.getByRole('region',{name:/Parâmetros/i})
  await user.clear(within(editor).getByLabelText(/Distância/i))
  await user.type(within(editor).getByLabelText(/Distância/i),'999')
  expect((screen.getByRole('button',{name:/Exportar projeto/i}) as HTMLButtonElement).disabled).toBe(true)
})
