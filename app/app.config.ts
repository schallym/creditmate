export default defineAppConfig({
  toaster: {
    position: 'bottom-right' as const,
    expand: true,
    duration: 5000
  },
  ui: {
    colors: {
      primary: 'blue'
    },
    button: {
      defaultVariants: {
        variant: 'subtle'
      },
      slots: {
        base: ['cursor-pointer']
      }
    }
  }
});
